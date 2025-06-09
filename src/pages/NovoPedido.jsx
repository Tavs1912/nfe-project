import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import TipoPedidoSelecao from "@/components/novopedido/TipoPedidoSelecao";
import PedidoAutomaticoDetalhes from "@/components/novopedido/PedidoAutomaticoDetalhes";
import PedidoManualForm from "@/components/novopedido/PedidoManualForm";

const NovoPedido = () => {
  const navigate = useNavigate();
  const { estoque, fornecedores, addPedido, addAuditLog } = useData();
  const { user } = useAuth();
  const [tipoPedido, setTipoPedido] = useState(null); // 'automatico' ou 'manual'
  const [itensParaPedidoAutomatico, setItensParaPedidoAutomatico] = useState(
    []
  );

  const getPrecoUnitarioSimulado = (item) => {
    return (
      item.preco_compra ||
      item.custo_unitario ||
      (parseFloat(item.codigo.replace(/\D/g, "")) % 100) + 0.5 ||
      Math.random() * 20 + 5
    );
  };

  useEffect(() => {
    if (tipoPedido === "automatico") {
      const itensParaRepor = estoque.filter((item) => {
        const isCriticoOuAbaixoMinimo =
          item.minimo > 0 && item.quantidade_atual < item.minimo;
        const precisaReporParaMaximo =
          item.maximo > 0 &&
          item.quantidade_atual < item.maximo &&
          item.quantidade_atual >= item.minimo;

        return (
          item.ativo &&
          item.fornecedor_id &&
          (isCriticoOuAbaixoMinimo ||
            (precisaReporParaMaximo && item.minimo > 0))
        ); // Garante que minimo > 0 se for repor para maximo
      });

      const itensComQuantidade = itensParaRepor
        .map((item) => {
          const loteReposicaoEfetivo =
            item.lote_reposicao > 0 ? item.lote_reposicao : 1;
          let quantidadeNecessaria;
          let metaReposicao;

          if (item.quantidade_atual < item.minimo) {
            // Prioridade: sair do crítico
            metaReposicao =
              item.maximo && item.maximo > item.minimo
                ? item.maximo
                : item.minimo * 1.5; // Tenta atingir max, ou 1.5x min
            quantidadeNecessaria = Math.max(
              0,
              metaReposicao - item.quantidade_atual
            );
            // Se ainda assim for 0 (ex: maximo = atual), mas está abaixo do minimo, precisa pedir ao menos o lote.
            if (quantidadeNecessaria <= 0) {
              quantidadeNecessaria = loteReposicaoEfetivo;
            }
          } else if (item.maximo > 0 && item.quantidade_atual < item.maximo) {
            // Repor para atingir o máximo
            metaReposicao = item.maximo;
            quantidadeNecessaria = Math.max(
              0,
              metaReposicao - item.quantidade_atual
            );
          } else {
            quantidadeNecessaria = 0; // Não precisa repor se não estiver crítico e não tiver máximo definido ou já estiver no máximo/excesso
          }

          let quantidadePedir = 0;
          if (quantidadeNecessaria > 0) {
            quantidadePedir =
              Math.ceil(quantidadeNecessaria / loteReposicaoEfetivo) *
              loteReposicaoEfetivo;
          }

          // Caso especial: se a quantidade a pedir for 0, mas o item está abaixo do mínimo,
          // e o cálculo acima não resultou em pedido (ex: maximo muito próximo do atual),
          // força pedir ao menos um lote para tentar sair do crítico.
          if (
            quantidadePedir <= 0 &&
            item.quantidade_atual < item.minimo &&
            item.minimo > 0
          ) {
            quantidadePedir = loteReposicaoEfetivo;
          }

          return {
            ...item,
            quantidadePedir: quantidadePedir,
            item_estoque_id: item.id,
            descricao_item: item.descricao,
            preco_unitario: getPrecoUnitarioSimulado(item),
          };
        })
        .filter((item) => item.quantidadePedir > 0); // Filtra apenas itens que realmente precisam de quantidade > 0

      setItensParaPedidoAutomatico(itensComQuantidade);
    }
  }, [tipoPedido, estoque, fornecedores]);

  const handleCriarPedidosAutomaticos = async (observacao) => {
    if (itensParaPedidoAutomatico.length === 0) {
      toast({
        title: "Nenhum item para repor",
        description:
          "Não há itens ativos que necessitem de reposição automática, tenham fornecedor definido e quantidade a pedir maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const pedidosPorFornecedor = itensParaPedidoAutomatico.reduce(
      (acc, item) => {
        const fornecedorId = item.fornecedor_id;
        if (!fornecedorId) {
          return acc;
        }
        const fornecedorInfo = fornecedores.find((f) => f.id === fornecedorId);
        if (!fornecedorInfo || !fornecedorInfo.ativo) {
          return acc;
        }

        if (!acc[fornecedorId]) {
          acc[fornecedorId] = {
            fornecedorInfo: fornecedorInfo,
            itens: [],
          };
        }
        acc[fornecedorId].itens.push({
          item_estoque_id: item.id,
          descricao_item: item.descricao,
          quantidade: item.quantidadePedir,
          preco_unitario: item.preco_unitario,
        });
        return acc;
      },
      {}
    );

    let pedidosCriadosCount = 0;
    let pedidosFalhadosCount = 0;

    for (const fornecedorIdKey in pedidosPorFornecedor) {
      const pedidoInfoAgrupado = pedidosPorFornecedor[fornecedorIdKey];
      if (!pedidoInfoAgrupado.fornecedorInfo) {
        pedidosFalhadosCount++;
        continue;
      }

      const pedidoData = {
        tipo: "Automático",
        status: "Em Aberto",
        fornecedor_id: pedidoInfoAgrupado.fornecedorInfo.id,
        fornecedor_nome: pedidoInfoAgrupado.fornecedorInfo.nome,
        data_criacao: new Date().toISOString().split("T")[0],
        observacoes: observacao || "",
      };

      const itensDoPedido = pedidoInfoAgrupado.itens;

      try {
        const pedidoCriado = await addPedido(pedidoData, itensDoPedido);
        addAuditLog(
          "Criação",
          "Pedido",
          `Pedido automático ${pedidoCriado.numero} criado para ${pedidoCriado.fornecedor_nome}`,
          null,
          `Status: ${pedidoCriado.status}, Obs: ${pedidoData.observacoes}, Tipo: Automático`
        );
        pedidosCriadosCount++;
      } catch (error) {
        console.error(
          "Erro ao criar pedido automático para fornecedor:",
          pedidoInfoAgrupado.fornecedorInfo.nome,
          error
        );
        pedidosFalhadosCount++;
        toast({
          title: `Erro ao criar pedido para ${pedidoInfoAgrupado.fornecedorInfo.nome}`,
          description: error.message || "Falha ao registrar o pedido.",
          variant: "destructive",
        });
      }
    }

    if (pedidosCriadosCount > 0) {
      toast({
        title: "Pedidos automáticos processados!",
        description: `${pedidosCriadosCount} pedido(s) automático(s) foram gerados com sucesso. ${
          pedidosFalhadosCount > 0 ? `${pedidosFalhadosCount} falharam.` : ""
        }`,
      });
    } else if (pedidosFalhadosCount > 0) {
      toast({
        title: "Falha ao criar pedidos automáticos",
        description: `Todos os ${pedidosFalhadosCount} pedidos automáticos falharam. Verifique os logs.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Nenhum pedido automático criado",
        description:
          "Verifique se os itens para reposição são ativos, possuem fornecedores associados ativos e necessitam de reposição.",
        variant: "destructive",
      });
    }
    if (pedidosCriadosCount > 0) navigate("/pedidos");
  };

  const handleCriarPedidoManual = async (
    selectedFornecedorId,
    itensPedidoManualFront,
    observacao
  ) => {
    const fornecedorInfo = fornecedores.find(
      (f) => f.id.toString() === selectedFornecedorId
    );
    if (!fornecedorInfo) {
      toast({
        title: "Erro",
        description: "Fornecedor não encontrado.",
        variant: "destructive",
      });
      return;
    }
    if (!fornecedorInfo.ativo) {
      toast({
        title: "Erro",
        description: "O fornecedor selecionado está inativo.",
        variant: "destructive",
      });
      return;
    }

    const itensDoPedidoParaSalvar = itensPedidoManualFront.map((itemFront) => {
      const itemEstoqueOriginal = estoque.find(
        (e) => e.id === itemFront.item_estoque_id
      );
      return {
        item_estoque_id: itemFront.item_estoque_id,
        descricao_item: itemEstoqueOriginal?.descricao || itemFront.descricao,
        quantidade: itemFront.quantidade,
        preco_unitario: itemFront.preco_unitario,
      };
    });

    const pedidoData = {
      tipo: "Manual",
      status: "Em Aberto",
      fornecedor_id: parseInt(selectedFornecedorId),
      fornecedor_nome: fornecedorInfo.nome,
      data_criacao: new Date().toISOString().split("T")[0],
      observacoes: observacao || "",
    };

    try {
      const pedidoCriado = await addPedido(pedidoData, itensDoPedidoParaSalvar);
      addAuditLog(
        "Criação",
        "Pedido",
        `Pedido manual ${pedidoCriado.numero} criado para ${pedidoCriado.fornecedor_nome}`,
        null,
        `Status: ${pedidoCriado.status}, Obs: ${pedidoData.observacoes}, Tipo: Manual`
      );
      toast({
        title: "Pedido manual criado!",
        description: `O pedido para ${fornecedorInfo.nome} foi criado com sucesso.`,
      });
      navigate("/pedidos");
    } catch (error) {
      console.error("Erro ao criar pedido manual:", error);
      toast({
        title: "Erro ao criar pedido manual",
        description: error.message || "Não foi possível registrar o pedido.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-4 mb-6"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            tipoPedido ? setTipoPedido(null) : navigate("/pedidos")
          }
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold gradient-text">
          Novo Pedido de Reabastecimento
        </h1>
      </motion.div>

      {!tipoPedido && <TipoPedidoSelecao onSelectTipo={setTipoPedido} />}

      {tipoPedido === "automatico" && (
        <PedidoAutomaticoDetalhes
          itensParaPedido={itensParaPedidoAutomatico}
          fornecedores={fornecedores.filter((f) => f.ativo)}
          onCriarPedidos={handleCriarPedidosAutomaticos}
          onVoltar={() => setTipoPedido(null)}
        />
      )}

      {tipoPedido === "manual" && (
        <PedidoManualForm
          fornecedores={fornecedores.filter((f) => f.ativo)}
          estoque={estoque.filter((i) => i.ativo)}
          onCriarPedido={handleCriarPedidoManual}
          onVoltar={() => setTipoPedido(null)}
        />
      )}
    </div>
  );
};

export default NovoPedido;
