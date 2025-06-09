
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import EstoqueHeader from '@/components/estoque/EstoqueHeader';
import EstoqueFilters from '@/components/estoque/EstoqueFilters';
import EstoqueTable from '@/components/estoque/EstoqueTable';
import ItemDialog from '@/components/ItemDialog';
import { getStockStatus } from '@/utils/vmi';

const Estoque = () => {
  const { estoque, updateEstoque, createEstoqueItem, fornecedores, addAuditLog } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [fornecedorFilter, setFornecedorFilter] = useState('todos');
  const [atividadeFilter, setAtividadeFilter] = useState('todos');
  const [currentItem, setCurrentItem] = useState(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  const isAdmin = user?.papel === 'Administrador' || user?.papel === 'admin';

  const filteredEstoque = estoque.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = item.codigo.toLowerCase().includes(searchLower) ||
                         item.descricao.toLowerCase().includes(searchLower) ||
                         (item.unidade && item.unidade.toLowerCase().includes(searchLower)) ||
                         (item.localizacao && item.localizacao.toLowerCase().includes(searchLower));
    
    const itemStatusInfo = getStockStatus(item.quantidade_atual, item.minimo, item.maximo);
    const matchesStatus = statusFilter === 'todos' || itemStatusInfo.status === statusFilter;
    
    const matchesFornecedor = fornecedorFilter === 'todos' || 
      (fornecedorFilter === 'nenhum' && !item.fornecedor_id) || 
      (item.fornecedor_id && item.fornecedor_id.toString() === fornecedorFilter);
    
    const itemAtivo = item.ativo === undefined ? true : item.ativo;
    const matchesAtividade = atividadeFilter === 'todos' ||
                             (atividadeFilter === 'ativos' && itemAtivo) ||
                             (atividadeFilter === 'inativos' && !itemAtivo);
        
    return matchesSearch && matchesStatus && matchesFornecedor && matchesAtividade;
  });

  const handleOpenItemDialog = (item = null) => {
    if (item) {
      setCurrentItem({ 
        ...item,
        ativo: item.ativo === undefined ? true : item.ativo,
        // valor_unitario já deve vir do item.
      });
      setIsCreatingItem(false);
    } else {
      setCurrentItem({
        codigo: '',
        descricao: '',
        unidade: 'UN', 
        quantidade_atual: 0,
        minimo: 0,
        maximo: 0,
        valor_unitario: 0, // Inicializar valor_unitario para novos itens
        lote_reposicao: 0,
        fornecedor_id: null,
        fornecedor_nome: '',
        status: 'Normal', 
        localizacao: '',
        ativo: true,
        lead_time_entrega: 0,
      });
      setIsCreatingItem(true);
    }
    setIsItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!currentItem) return;

    if (!currentItem.codigo || !currentItem.descricao || !currentItem.unidade) {
       toast({
        title: "Campos obrigatórios",
        description: "Código, Descrição e Unidade do item são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    const statusInfo = getStockStatus(currentItem.quantidade_atual, currentItem.minimo, currentItem.maximo);
    const selectedFornecedor = fornecedores.find(f => f.id === parseInt(currentItem.fornecedor_id));

    const itemToSave = {
      codigo: currentItem.codigo,
      descricao: currentItem.descricao,
      unidade: currentItem.unidade,
      localizacao: currentItem.localizacao,
      ativo: currentItem.ativo === undefined ? true : currentItem.ativo,
      minimo: parseFloat(currentItem.minimo) || 0,
      maximo: parseFloat(currentItem.maximo) || 0,
      quantidade_atual: parseFloat(currentItem.quantidade_atual) || 0,
      lote_reposicao: parseFloat(currentItem.lote_reposicao) || 0,
      lead_time_entrega: parseInt(currentItem.lead_time_entrega) || 0,
      fornecedor_id: currentItem.fornecedor_id ? parseInt(currentItem.fornecedor_id) : null,
      fornecedor_nome: selectedFornecedor ? selectedFornecedor.nome : null,
      status: statusInfo.status,
      valor_unitario: parseFloat(currentItem.valor_unitario) || 0,
    };
    
    try {
      let savedItem;
      let auditAction;
      let auditDetails;
      let toastTitle;
      let toastDescription;

      if (isCreatingItem) {
        savedItem = await createEstoqueItem(itemToSave);
        auditAction = 'Criação';
        auditDetails = `Item ${savedItem.codigo} criado (Valor: R$ ${savedItem.valor_unitario?.toFixed(2)})`;
        toastTitle = "Item cadastrado!";
        toastDescription = `${savedItem.descricao} foi cadastrado com sucesso.`;
      } else {
        if (typeof currentItem.id === 'undefined') {
           toast({ title: "Erro", description: "ID do item não encontrado para atualização.", variant: "destructive" });
           return;
        }
        savedItem = await updateEstoque({ ...itemToSave, id: currentItem.id });
        auditAction = 'Edição';
        auditDetails = `Item ${savedItem.codigo} atualizado (Valor: R$ ${savedItem.valor_unitario?.toFixed(2)})`;
        toastTitle = "Item atualizado!";
        toastDescription = `${savedItem.descricao} foi atualizado com sucesso.`;
      }

      addAuditLog(
        auditAction,
        'Estoque',
        auditDetails,
        isCreatingItem ? null : estoque.find(i => i.id === savedItem.id),
        savedItem
      );

      toast({
        title: toastTitle,
        description: toastDescription,
      });

      setIsItemDialogOpen(false);
      setCurrentItem(null);
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o item.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAtivo = async (item) => {
    if (!isAdmin) return;
    try {
      const itemAtualizado = { ...item, ativo: !item.ativo };
      const savedItem = await updateEstoque(itemAtualizado);
      addAuditLog(
        'Alteração de Status (Ativo/Inativo)',
        'Estoque',
        `Status do item ${savedItem.codigo} alterado para ${savedItem.ativo ? 'Ativo' : 'Inativo'}.`,
        item,
        savedItem
      );
      toast({
        title: "Status alterado!",
        description: `O item ${savedItem.descricao} foi marcado como ${savedItem.ativo ? 'ativo' : 'inativo'}.`,
      });
    } catch (error) {
      console.error("Erro ao alterar status do item:", error);
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Não foi possível alterar o status do item.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-6">
      <EstoqueHeader isAdmin={isAdmin} onOpenDialog={handleOpenItemDialog} />
      <EstoqueFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        fornecedorFilter={fornecedorFilter}
        setFornecedorFilter={setFornecedorFilter}
        atividadeFilter={atividadeFilter}
        setAtividadeFilter={setAtividadeFilter}
        fornecedores={fornecedores}
        showAtividadeFilter={true} 
      />
      <EstoqueTable
        estoque={filteredEstoque}
        isAdmin={isAdmin}
        onOpenDialog={handleOpenItemDialog}
        onToggleAtivo={handleToggleAtivo}
        showAtivoColumn={true}
      />
      <ItemDialog
        isOpen={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
        isCreating={isCreatingItem}
        fornecedores={fornecedores}
        onSave={handleSaveItem}
      />
    </div>
  );
};

export default Estoque;
