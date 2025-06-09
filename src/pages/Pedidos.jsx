import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

import PedidoHeader from '@/components/pedidos/PedidoHeader';
import PedidoFilters from '@/components/pedidos/PedidoFilters';
import PedidoTable from '@/components/pedidos/PedidoTable';
import PedidoDetailsDialog from '@/components/pedidos/PedidoDetailsDialog';
import { toast } from '@/components/ui/use-toast';


const Pedidos = () => {
  const { pedidos, fornecedores, estoque, updatePedidos, updateEstoque, addAuditLog } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [fornecedorFilter, setFornecedorFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isAdmin = user?.papel === 'Administrador' || user?.papel === 'admin';

  const checkPedidoAtraso = (pedido) => {
    if (!pedido || !pedido.itens_pedido || !pedido.data_criacao) return false;
    const dataCriacaoPedido = new Date(pedido.data_criacao);
    const hoje = new Date();
  
    for (const itemPedido of pedido.itens_pedido) {
        const itemEstoque = estoque.find(e => e.id === itemPedido.item_estoque_id);
        // Supondo que 'lead_time_medio' está em 'fornecedores' e o pedido tem 'fornecedor_id'
        const fornecedorDoPedido = fornecedores.find(f => f.id === pedido.fornecedor_id);

        let leadTime = 0;
        if (itemEstoque && itemEstoque.lote_reposicao > 0) { // Assume-se que lote_reposicao pode ser um proxy para lead time se não houver lead_time_entrega no item
            leadTime = itemEstoque.lote_reposicao; // Usar um campo mais apropriado se existir
        } else if (fornecedorDoPedido && fornecedorDoPedido.lead_time_medio) {
            leadTime = fornecedorDoPedido.lead_time_medio;
        }

        if (leadTime > 0) {
            const dataEntregaEsperada = new Date(dataCriacaoPedido);
            dataEntregaEsperada.setDate(dataEntregaEsperada.getDate() + leadTime);
            if (hoje > dataEntregaEsperada && (pedido.status !== 'Recebido' && pedido.status !== 'Atendido' && pedido.status !== 'Cancelado')) {
              return true; 
            }
        }
    }
    return false;
  };
  
  const getStatusComAtraso = (pedido) => {
    if (pedido.status === 'Recebido' || pedido.status === 'Cancelado' || pedido.status === 'Atendido') {
      return pedido.status;
    }
    if (checkPedidoAtraso(pedido)) {
      return 'Em Atraso';
    }
    return pedido.status;
  };

  const filteredPedidos = pedidos.map(p => ({...p, statusReal: getStatusComAtraso(p)}))
  .filter(pedido => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = pedido.numero.toLowerCase().includes(searchLower) ||
                         (pedido.fornecedor_nome && pedido.fornecedor_nome.toLowerCase().includes(searchLower)) ||
                         (pedido.observacoes && pedido.observacoes.toLowerCase().includes(searchLower));
    const matchesStatus = statusFilter === 'todos' || pedido.statusReal === statusFilter;
    const matchesFornecedor = fornecedorFilter === 'todos' || (pedido.fornecedor_id && pedido.fornecedor_id.toString() === fornecedorFilter);
    
    // Adicionar tipo de pedido ao filtro se existir na estrutura de dados do pedido
    // const matchesTipo = tipoFilter === 'todos' || pedido.tipo === tipoFilter; 
    // return matchesSearch && matchesStatus && matchesFornecedor && matchesTipo;
    return matchesSearch && matchesStatus && matchesFornecedor;

  }).sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));


  const handleViewDetails = (pedido) => {
    setSelectedPedido({...pedido, statusReal: getStatusComAtraso(pedido)});
    setIsDialogOpen(true);
  };

  const handleNovoPedido = () => {
    navigate('/pedidos/novo');
  };

  const handleReceberPedido = async () => {
    if (!selectedPedido || !selectedPedido.itens_pedido) return;

    try {
      for (const itemPedido of selectedPedido.itens_pedido) {
        const itemEstoqueOriginal = estoque.find(e => e.id === itemPedido.item_estoque_id);
        if (itemEstoqueOriginal) {
          const quantidadeNova = (parseFloat(itemEstoqueOriginal.quantidade_atual) || 0) + (parseFloat(itemPedido.quantidade) || 0);
          await updateEstoque({ 
            ...itemEstoqueOriginal, 
            quantidade_atual: quantidadeNova 
          });
        }
      }
      
      const statusFinal = selectedPedido.statusReal === 'Em Atraso' ? 'Recebido (Atrasado)' : 'Recebido';
      const pedidoAtualizadoParaSupabase = { 
        id: selectedPedido.id,
        status: statusFinal 
      };
      
      // Não passar itens_pedido ou outros campos não pertencentes diretamente à tabela `pedidos`
      const { itens_pedido, statusReal, fornecedor_nome, ...cleanPedidoData } = selectedPedido;
      const pedidoParaUpdate = {
          ...cleanPedidoData,
          status: statusFinal,
      };

      await updatePedidos(pedidoParaUpdate);


      addAuditLog(
        'Recebimento', 
        'Pedido', 
        `Pedido ${selectedPedido.numero} recebido. Estoque atualizado. Status: ${statusFinal}`,
        `Status Anterior: ${selectedPedido.status}`,
        `Status Novo: ${statusFinal}`
      );

      toast({
        title: "Pedido Recebido!",
        description: `O pedido ${selectedPedido.numero} foi marcado como ${statusFinal} e o estoque atualizado.`,
      });
      setIsDialogOpen(false);
      setSelectedPedido(null);
    } catch(error) {
        console.error("Erro ao receber pedido:", error);
        toast({
            title: "Erro ao Receber Pedido",
            description: error.message || "Não foi possível atualizar o pedido ou o estoque.",
            variant: "destructive"
        });
    }
  };

  return (
    <div className="space-y-6">
      <PedidoHeader onNovoPedido={handleNovoPedido} />
      <PedidoFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        fornecedorFilter={fornecedorFilter}
        setFornecedorFilter={setFornecedorFilter}
        fornecedores={fornecedores}
        tipoFilter={tipoFilter} // Adicionar se for usar
        setTipoFilter={setTipoFilter} // Adicionar se for usar
      />
      <PedidoTable
        pedidos={filteredPedidos}
        onViewDetails={handleViewDetails}
        getStatusComAtraso={getStatusComAtraso} // Passar a função se for usada diretamente na tabela
      />
      <PedidoDetailsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedPedido={selectedPedido}
        isAdmin={isAdmin}
        onReceberPedido={handleReceberPedido}
        getStatusComAtraso={getStatusComAtraso}
      />
    </div>
  );
};

export default Pedidos;