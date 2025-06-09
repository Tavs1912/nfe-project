import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData deve ser usado dentro de um DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [estoque, setEstoque] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // Mapeado para 'profiles'
  const [auditoria, setAuditoria] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setEstoque([]);
      setPedidos([]);
      setFornecedores([]);
      setUsuarios([]);
      setAuditoria([]);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    try {
      const [
        { data: estoqueData, error: estoqueError },
        { data: pedidosData, error: pedidosError },
        { data: fornecedoresData, error: fornecedoresError },
        { data: usuariosData, error: usuariosError },
        { data: auditoriaData, error: auditoriaError },
      ] = await Promise.all([
        supabase.from("estoque").select("*"),
        supabase.from("pedidos").select("*, itens_pedido(*)"),
        supabase.from("fornecedores").select("*"),
        supabase.from("profiles").select("*"),
        supabase
          .from("auditoria")
          .select("*")
          .order("timestamp", { ascending: false }),
      ]);

      if (estoqueError) {
        console.error("Erro ao buscar estoque:", estoqueError);
        throw estoqueError;
      }
      if (pedidosError) {
        console.error("Erro ao buscar pedidos:", pedidosError);
        throw pedidosError;
      }
      if (fornecedoresError) {
        console.error("Erro ao buscar fornecedores:", fornecedoresError);
        throw fornecedoresError;
      }
      if (usuariosError) {
        console.error("Erro ao buscar usuários:", usuariosError);
        throw usuariosError;
      }
      if (auditoriaError) {
        console.error("Erro ao buscar auditoria:", auditoriaError);
        throw auditoriaError;
      }

      setEstoque(estoqueData || []);
      setPedidos(pedidosData || []);
      setFornecedores(fornecedoresData || []);
      setUsuarios(usuariosData || []);
      setAuditoria(auditoriaData || []);
    } catch (error) {
      console.error("Erro geral ao buscar dados:", error);
      if (error.message.includes("Failed to fetch")) {
        // Poderia exibir um toast ou mensagem para o usuário sobre problemas de conexão
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const addAuditLog = async (
    acao,
    entidade,
    detalhes,
    antes = null,
    depois = null
  ) => {
    if (!user) {
      console.warn(
        "Tentativa de adicionar log de auditoria sem usuário logado."
      );
      return;
    }
    try {
      const logEntry = {
        usuario_id: user.id,
        usuario_email: user.email,
        papel: user.papel || "user",
        acao: `${entidade}: ${acao}`,
        detalhes: JSON.stringify({ detalhes, antes, depois }),
      };
      const { error } = await supabase.from("auditoria").insert(logEntry);
      if (error) throw error;
      setAuditoria((prev) => [logEntry, ...prev.slice(0, 99)]);
    } catch (error) {
      console.error("Erro ao adicionar log de auditoria:", error);
    }
  };

  const createEstoqueItem = async (novoItem) => {
    // O objeto novoItem já deve vir com os nomes corretos das colunas do BD
    // Ex: quantidade_atual, lote_reposicao, lead_time_entrega, fornecedor_id
    const { data, error } = await supabase
      .from("estoque")
      .insert(novoItem)
      .select()
      .single();
    if (error) {
      console.error("Erro ao criar item de estoque:", error);
      throw error;
    }
    addAuditLog(
      "Criação",
      "Estoque",
      `Novo item ${data.codigo} criado.`,
      null,
      data
    );
    setEstoque((prev) => [data, ...prev]);
    return data;
  };

  const updateEstoqueItem = async (itemAtualizado) => {
    if (!itemAtualizado || typeof itemAtualizado.id === "undefined") {
      console.error(
        "updateEstoqueItem: ID do item é indefinido.",
        itemAtualizado
      );
      throw new Error("ID do item é inválido para atualização.");
    }

    // O objeto itemAtualizado já deve vir com os nomes corretos das colunas do BD
    const { data: itemAntigo } = await supabase
      .from("estoque")
      .select("*")
      .eq("id", itemAtualizado.id)
      .single();
    const { data, error } = await supabase
      .from("estoque")
      .update(itemAtualizado)
      .eq("id", itemAtualizado.id)
      .select()
      .single();
    if (error) {
      console.error("Erro ao atualizar item de estoque:", error);
      throw error;
    }
    addAuditLog(
      "Atualização",
      "Estoque",
      `Item ${data.codigo} atualizado.`,
      itemAntigo,
      data
    );
    setEstoque((prev) =>
      prev.map((item) => (item.id === data.id ? data : item))
    );
    return data;
  };

  const generateOrderNumber = async () => {
    // Get the current year and month for the prefix
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `${year}${month}`;

    // Get the highest existing order number for this month
    const { data: existingOrders, error } = await supabase
      .from("pedidos")
      .select("numero")
      .ilike("numero", `${prefix}%`)
      .order("numero", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Erro ao buscar números existentes:", error);
      // Fallback: use timestamp-based number if query fails
      return `${prefix}${String(Date.now()).slice(-4)}`;
    }

    let nextSequence = 1;
    if (existingOrders && existingOrders.length > 0) {
      const lastNumber = existingOrders[0].numero;
      const sequencePart = lastNumber.substring(6); // Remove YYYYMM prefix
      nextSequence = parseInt(sequencePart) + 1;
    }

    // Format: YYYYMM + 4-digit sequence (e.g., 2025060001)
    return `${prefix}${String(nextSequence).padStart(4, "0")}`;
  };

  const addPedido = async (pedidoData, itensPedidoData) => {
    // Generate unique order number
    const numeroGerado = await generateOrderNumber();
    
    // Calculate total value from items
    let valorTotal = 0;
    if (itensPedidoData && itensPedidoData.length > 0) {
      valorTotal = itensPedidoData.reduce((total, item) => {
        const quantidade = parseFloat(item.quantidade) || 0;
        const precoUnitario = parseFloat(item.preco_unitario) || 0;
        return total + (quantidade * precoUnitario);
      }, 0);
    }

    const { data: novoPedido, error: pedidoError } = await supabase
      .from("pedidos")
      .insert({ 
        ...pedidoData, 
        numero: numeroGerado, 
        usuario_id: user.id,
        valor_total: valorTotal
      })
      .select()
      .single();
    if (pedidoError) {
      console.error("Erro ao criar pedido:", pedidoError);
      throw pedidoError;
    }

    if (itensPedidoData && itensPedidoData.length > 0) {
      const itensParaInserir = itensPedidoData.map((item) => {
        const quantidade = parseFloat(item.quantidade) || 0;
        const precoUnitario = parseFloat(item.preco_unitario) || 0;
        const subtotal = quantidade * precoUnitario;
        
        return {
          ...item,
          pedido_id: novoPedido.id,
          subtotal: subtotal,
        };
      });
      const { error: itensError } = await supabase
        .from("itens_pedido")
        .insert(itensParaInserir);
      if (itensError) {
        console.error("Erro ao inserir itens do pedido:", itensError);
        await supabase.from("pedidos").delete().eq("id", novoPedido.id);
        throw new Error("Falha ao criar itens do pedido. Pedido revertido.");
      }
      novoPedido.itens_pedido = itensParaInserir;
    }

    addAuditLog(
      "Criação",
      "Pedido",
      `Novo pedido ${novoPedido.numero} criado.`,
      null,
      novoPedido
    );
    setPedidos((prev) => [novoPedido, ...prev]);
    return novoPedido;
  };

  const updatePedido = async (
    pedidoAtualizado,
    novosItensPedido = [],
    itensRemovidosIds = [],
    itensAtualizados = []
  ) => {
    if (!pedidoAtualizado || typeof pedidoAtualizado.id === "undefined") {
      console.error(
        "updatePedido: ID do pedido é indefinido.",
        pedidoAtualizado
      );
      throw new Error("ID do pedido é inválido para atualização.");
    }
    const { data: pedidoAntigo } = await supabase
      .from("pedidos")
      .select("*, itens_pedido(*)")
      .eq("id", pedidoAtualizado.id)
      .single();

    const { id, itens_pedido, ...updateDataPedido } = pedidoAtualizado;

    const { data: pedidoSalvo, error: pedidoError } = await supabase
      .from("pedidos")
      .update(updateDataPedido)
      .eq("id", id)
      .select()
      .single();
    if (pedidoError) {
      console.error("Erro ao atualizar pedido:", pedidoError);
      throw pedidoError;
    }

    if (itensRemovidosIds && itensRemovidosIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("itens_pedido")
        .delete()
        .in("id", itensRemovidosIds);
      if (deleteError)
        console.error("Erro ao remover itens do pedido:", deleteError);
    }

    if (itensAtualizados && itensAtualizados.length > 0) {
      for (const item of itensAtualizados) {
        if (!item || typeof item.id === "undefined") {
          console.error(
            "updatePedido: ID do item a ser atualizado é indefinido.",
            item
          );
          continue;
        }
        const { id: itemId, pedido_id, ...itemUpdateData } = item;
        const { error: updateItemError } = await supabase
          .from("itens_pedido")
          .update(itemUpdateData)
          .eq("id", itemId);
        if (updateItemError)
          console.error(
            "Erro ao atualizar item do pedido:",
            updateItemError,
            item
          );
      }
    }

    if (novosItensPedido && novosItensPedido.length > 0) {
      const itensParaInserir = novosItensPedido.map((item) => ({
        ...item,
        pedido_id: pedidoSalvo.id,
      }));
      const { error: insertItensError } = await supabase
        .from("itens_pedido")
        .insert(itensParaInserir);
      if (insertItensError)
        console.error(
          "Erro ao adicionar novos itens ao pedido:",
          insertItensError
        );
    }

    const { data: pedidoFinal, error: fetchFinalError } = await supabase
      .from("pedidos")
      .select("*, itens_pedido(*)")
      .eq("id", pedidoSalvo.id)
      .single();
    if (fetchFinalError) {
      console.error("Erro ao buscar pedido final:", fetchFinalError);
      throw fetchFinalError;
    }

    addAuditLog(
      "Atualização",
      "Pedido",
      `Pedido ${pedidoFinal.numero} atualizado.`,
      pedidoAntigo,
      pedidoFinal
    );
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedidoFinal.id ? pedidoFinal : p))
    );
    return pedidoFinal;
  };

  const createFornecedor = async (novoFornecedor) => {
    const { data, error } = await supabase
      .from("fornecedores")
      .insert(novoFornecedor)
      .select()
      .single();
    if (error) {
      console.error("Erro ao criar fornecedor:", error);
      throw error;
    }
    addAuditLog(
      "Criação",
      "Fornecedor",
      `Novo fornecedor ${data.nome} criado.`,
      null,
      data
    );
    setFornecedores((prev) => [data, ...prev]);
    return data;
  };

  const updateFornecedor = async (fornecedorAtualizado) => {
    if (
      !fornecedorAtualizado ||
      typeof fornecedorAtualizado.id === "undefined"
    ) {
      console.error(
        "updateFornecedor: ID do fornecedor é indefinido.",
        fornecedorAtualizado
      );
      throw new Error("ID do fornecedor é inválido para atualização.");
    }
    const { data: fornecedorAntigo } = await supabase
      .from("fornecedores")
      .select("*")
      .eq("id", fornecedorAtualizado.id)
      .single();
    const { data, error } = await supabase
      .from("fornecedores")
      .update(fornecedorAtualizado)
      .eq("id", fornecedorAtualizado.id)
      .select()
      .single();
    if (error) {
      console.error("Erro ao atualizar fornecedor:", error);
      throw error;
    }
    addAuditLog(
      "Atualização",
      "Fornecedor",
      `Fornecedor ${data.nome} atualizado.`,
      fornecedorAntigo,
      data
    );
    setFornecedores((prev) => prev.map((f) => (f.id === data.id ? data : f)));
    return data;
  };

  const updateUsuariosApp = async (usuarioAtualizado) => {
    if (!usuarioAtualizado || typeof usuarioAtualizado.id === "undefined") {
      console.error(
        "updateUsuariosApp: ID do usuário é indefinido.",
        usuarioAtualizado
      );
      throw new Error("ID do usuário é inválido para atualização.");
    }
    const { id, ...updateData } = usuarioAtualizado;

    const { data: usuarioAntigo } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Erro ao atualizar perfil do usuário:", error);
      throw error;
    }
    addAuditLog(
      "Atualização",
      "Usuário (Perfil)",
      `Perfil do usuário ${data.nome || data.email} atualizado.`,
      usuarioAntigo,
      data
    );
    setUsuarios((prev) => prev.map((u) => (u.id === data.id ? data : u)));
    return data;
  };

  const createUsuarioApp = async (novoUsuarioData) => {
    console.warn(
      "createUsuarioApp em DataContext é para sincronização da UI. Use useAuth().signUp para criar usuários."
    );
    const placeholderUser = {
      id: `temp-${Date.now()}`,
      ...novoUsuarioData,
      email: novoUsuarioData.email || "placeholder@example.com",
    };
    setUsuarios((prev) => [placeholderUser, ...prev]);
    addAuditLog(
      "Criação (Local)",
      "Usuário (Perfil)",
      `Usuário ${placeholderUser.nome} adicionado localmente para UI.`,
      null,
      placeholderUser
    );
    return placeholderUser;
  };

  const value = {
    estoque,
    pedidos,
    fornecedores,
    usuarios,
    auditoria,
    loadingData,
    fetchData,
    updateEstoque: updateEstoqueItem,
    createEstoqueItem,
    addPedido,
    updatePedidos: updatePedido,
    updateFornecedores: updateFornecedor,
    createFornecedor,
    updateUsuariosApp,
    createUsuarioApp,
    addAuditLog,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
