
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Power } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ItemDialog from '@/components/ItemDialog'; 
import FornecedorCard from '@/components/fornecedores/FornecedorCard';
import FornecedorDialog from '@/components/fornecedores/FornecedorDialog';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Fornecedores = () => {
  const { 
    fornecedores, 
    createFornecedor, 
    updateFornecedor, // Corrigido para updateFornecedor
    addAuditLog, 
    estoque, 
    updateEstoque, 
    createEstoqueItem 
  } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFornecedor, setEditingFornecedor] = useState(null);
  const [isFornecedorDialogOpen, setIsFornecedorDialogOpen] = useState(false);
  const [isCreatingFornecedor, setIsCreatingFornecedor] = useState(false);
  const [selectedItemsForDialog, setSelectedItemsForDialog] = useState([]);
  const [activeTab, setActiveTab] = useState("dados");

  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isCreatingItemInDialog, setIsCreatingItemInDialog] = useState(false);

  const isAdmin = user?.papel === 'Administrador' || user?.papel === 'admin';

  const filteredFornecedores = fornecedores.map(f => ({
    ...f,
    itensVinculados: estoque.filter(item => item.fornecedor_id === f.id).length
  })).filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fornecedor.contato && fornecedor.contato.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (fornecedor.telefone && fornecedor.telefone.includes(searchTerm)) ||
    (fornecedor.endereco && fornecedor.endereco.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (editingFornecedor && !isCreatingFornecedor && editingFornecedor.id !== undefined) {
      const itemsVinculadosAoFornecedor = estoque
        .filter(item => item.fornecedor_id === editingFornecedor.id);
      setSelectedItemsForDialog(itemsVinculadosAoFornecedor);
    } else {
      setSelectedItemsForDialog([]);
    }
  }, [editingFornecedor, estoque, isCreatingFornecedor]);

  const handleEditFornecedor = (fornecedor) => {
    setEditingFornecedor({ ...fornecedor, ativo: fornecedor.ativo === undefined ? true : fornecedor.ativo });
    setIsCreatingFornecedor(false);
    setActiveTab("dados");
    setIsFornecedorDialogOpen(true);
  };

  const handleCreateFornecedor = () => {
    setEditingFornecedor({
      nome: '',
      contato: '',
      telefone: '',
      endereco: '',
      lead_time_medio: 0,
      ativo: true, // Default para novo fornecedor
    });
    setIsCreatingFornecedor(true);
    setActiveTab("dados");
    setSelectedItemsForDialog([]);
    setIsFornecedorDialogOpen(true);
  };
  

  const handleSaveFornecedor = async () => {
    if (!editingFornecedor) return;

    if (!editingFornecedor.nome) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do fornecedor é obrigatório.",
        variant: "destructive",
      });
      setActiveTab("dados");
      return;
    }

    try {
      let savedFornecedor;
      let auditAction;
      let auditDetails;

      const fornecedorDataToSave = {
        nome: editingFornecedor.nome,
        contato: editingFornecedor.contato || null,
        telefone: editingFornecedor.telefone || null,
        endereco: editingFornecedor.endereco || null,
        lead_time_medio: editingFornecedor.lead_time_medio || 0,
        ativo: editingFornecedor.ativo === undefined ? true : editingFornecedor.ativo, 
      };

      if (isCreatingFornecedor) {
        savedFornecedor = await createFornecedor(fornecedorDataToSave);
        auditAction = 'Criação';
        auditDetails = `Fornecedor ${savedFornecedor.nome} criado (Ativo: ${savedFornecedor.ativo})`;
      } else {
        if (typeof editingFornecedor.id === 'undefined') {
           toast({ title: "Erro", description: "ID do fornecedor não encontrado para atualização.", variant: "destructive" });
           return;
        }
        savedFornecedor = await updateFornecedor({ ...fornecedorDataToSave, id: editingFornecedor.id });
        auditAction = 'Edição';
        auditDetails = `Fornecedor ${savedFornecedor.nome} atualizado (Ativo: ${savedFornecedor.ativo})`;
      }

      addAuditLog(
        auditAction,
        'Fornecedor',
        auditDetails,
        isCreatingFornecedor ? null : fornecedores.find(f => f.id === savedFornecedor.id),
        savedFornecedor
      );

      const selectedItemIds = new Set(selectedItemsForDialog.map(item => item.id));
      const itemsOriginalmenteVinculados = estoque.filter(item => item.fornecedor_id === savedFornecedor.id);
      const itemsOriginalmenteVinculadosIds = new Set(itemsOriginalmenteVinculados.map(item => item.id));
      
      for (const item of estoque) {
        const isNowSelected = selectedItemIds.has(item.id);
        const wasOriginallyLinked = itemsOriginalmenteVinculadosIds.has(item.id);

        if (isNowSelected && item.fornecedor_id !== savedFornecedor.id) {
          await updateEstoque({ ...item, fornecedor_id: savedFornecedor.id, fornecedor_nome: savedFornecedor.nome });
          addAuditLog('Edição', 'Estoque', `Item ${item.codigo} vinculado ao fornecedor ${savedFornecedor.nome}`, `Fornecedor ID: ${item.fornecedor_id || 'Nenhum'}`, `Fornecedor ID: ${savedFornecedor.id}`);
        } else if (!isNowSelected && wasOriginallyLinked) {
          await updateEstoque({ ...item, fornecedor_id: null, fornecedor_nome: null });
          addAuditLog('Edição', 'Estoque', `Item ${item.codigo} desvinculado do fornecedor ${savedFornecedor.nome}`, `Fornecedor ID: ${item.fornecedor_id}`, `Fornecedor ID: null`);
        }
      }

      toast({
        title: `Fornecedor ${isCreatingFornecedor ? 'criado' : 'atualizado'}!`,
        description: `${savedFornecedor.nome} foi salvo com sucesso.`,
      });

      setIsFornecedorDialogOpen(false);
      setEditingFornecedor(null);
      setSelectedItemsForDialog([]);

    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o fornecedor.",
        variant: "destructive",
      });
    }
  };

  const handleOpenNewItemDialog = () => {
    setCurrentItem({
      codigo: '',
      descricao: '',
      unidade: 'UN',
      quantidade_atual: 0,
      minimo: 0,
      maximo: 0,
      valor_unitario: 0,
      lote_reposicao: 0,
      fornecedor_id: editingFornecedor?.id || null, 
      fornecedor_nome: editingFornecedor?.nome || '',
      status: 'Normal',
      ativo: true,
      lead_time_entrega: 0,
    });
    setIsCreatingItemInDialog(true);
    setIsItemDialogOpen(true);
  };

  const handleSaveNewItem = async () => {
    if (!currentItem) return;

    if (!currentItem.codigo || !currentItem.descricao || !currentItem.unidade) {
       toast({
        title: "Campos obrigatórios",
        description: "Código, Descrição e Unidade do item são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const novoItemData = {
        ...currentItem,
        fornecedor_id: editingFornecedor?.id || null,
        fornecedor_nome: editingFornecedor?.id ? editingFornecedor.nome : null,
      };
      
      const savedNewItem = await createEstoqueItem(novoItemData);

      toast({
        title: "Novo item cadastrado!",
        description: `${savedNewItem.descricao} foi cadastrado com sucesso e associado.`,
      });
      
      if (editingFornecedor && editingFornecedor.id) { 
        setSelectedItemsForDialog(prev => [...prev, savedNewItem]);
      }
      
      setIsItemDialogOpen(false);
      setCurrentItem(null);
    } catch (error) {
      console.error("Erro ao salvar novo item:", error);
      toast({
        title: "Erro ao salvar item",
        description: error.message || "Não foi possível salvar o novo item.",
        variant: "destructive",
      });
    }
  };

  const handleViewHistory = (fornecedor) => {
    toast({
      title: `Histórico de ${fornecedor.nome}`,
      description: "Funcionalidade de histórico de pedidos por fornecedor ainda não implementada.",
    });
  };

  const handleToggleAtivoFornecedor = async (fornecedor) => {
    if (!isAdmin) return;
    try {
      const fornecedorAtualizado = { ...fornecedor, ativo: !fornecedor.ativo };
      const savedFornecedor = await updateFornecedor(fornecedorAtualizado); // Usar updateFornecedor
      addAuditLog(
        'Alteração de Status (Ativo/Inativo)',
        'Fornecedor',
        `Status do fornecedor ${savedFornecedor.nome} alterado para ${savedFornecedor.ativo ? 'Ativo' : 'Inativo'}.`,
        fornecedor,
        savedFornecedor
      );
      toast({
        title: "Status do fornecedor alterado!",
        description: `O fornecedor ${savedFornecedor.nome} foi marcado como ${savedFornecedor.ativo ? 'ativo' : 'inativo'}.`,
      });
    } catch (error) {
      console.error("Erro ao alterar status do fornecedor:", error);
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Não foi possível alterar o status do fornecedor.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Gestão de Fornecedores</h1>
            <p className="text-slate-400 mt-2">
              Gerencie informações e histórico dos fornecedores
            </p>
          </div>
          {isAdmin && (
            <Button onClick={handleCreateFornecedor} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="glass-effect border-slate-700">
          <CardContent className="p-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome, contato, etc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFornecedores.map((fornecedor, index) => (
          <FornecedorCard 
            key={fornecedor.id}
            fornecedor={fornecedor}
            index={index}
            onEdit={handleEditFornecedor}
            onViewHistory={handleViewHistory}
            onToggleAtivo={isAdmin ? () => handleToggleAtivoFornecedor(fornecedor) : undefined}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      <FornecedorDialog
        isOpen={isFornecedorDialogOpen}
        onOpenChange={setIsFornecedorDialogOpen}
        editingFornecedor={editingFornecedor}
        setEditingFornecedor={setEditingFornecedor}
        isCreating={isCreatingFornecedor}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        estoque={estoque}
        selectedItems={selectedItemsForDialog}
        setSelectedItems={setSelectedItemsForDialog}
        onSave={handleSaveFornecedor}
        onOpenNewItemDialog={handleOpenNewItemDialog}
      />

      <ItemDialog
        isOpen={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
        isCreating={isCreatingItemInDialog}
        fornecedores={fornecedores} 
        onSave={handleSaveNewItem}
        dialogTitle="Cadastrar Novo Item e Associar"
        dialogDescription="Preencha os dados do novo item. Ele será automaticamente associado a este fornecedor se um fornecedor estiver sendo editado/criado."
      />
    </div>
  );
};

export default Fornecedores;
