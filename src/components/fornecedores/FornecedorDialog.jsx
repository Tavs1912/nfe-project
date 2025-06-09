
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, Info, ListChecks, PackagePlus, PlusCircle, Trash2, Power } from 'lucide-react';
import { toast } from '@/components/ui/use-toast'; // Corrigido aqui

const FornecedorDialog = ({
  isOpen,
  onOpenChange,
  editingFornecedor,
  setEditingFornecedor,
  isCreating,
  activeTab,
  setActiveTab,
  estoque,
  selectedItems,
  setSelectedItems,
  onSave,
  onOpenNewItemDialog
}) => {
  const [itemParaAdicionar, setItemParaAdicionar] = useState('');

  if (!editingFornecedor) return null;

  const handleAddItemToList = () => {
    if (!itemParaAdicionar) {
      toast({ title: "Nenhum item selecionado", description: "Por favor, selecione um item da lista.", variant: "destructive" });
      return;
    }
    const itemObj = estoque && Array.isArray(estoque) ? estoque.find(i => i.id.toString() === itemParaAdicionar) : null;
    if (itemObj && !selectedItems.find(i => i.id === itemObj.id)) {
      setSelectedItems([...selectedItems, itemObj]);
    } else if (selectedItems.find(i => i.id === itemObj.id)) {
      toast({ title: "Item já adicionado", description: "Este item já está na lista de associados.", variant: "default" });
    }
    setItemParaAdicionar('');
  };

  const handleRemoveItemFromList = (itemId) => {
    setSelectedItems(selectedItems.filter(i => i.id !== itemId));
  };

  const itensDisponiveisParaSelecao = estoque && Array.isArray(estoque) ? estoque.filter(
    item => !selectedItems.find(si => si.id === item.id) && 
            (!item.fornecedor_id || item.fornecedor_id === editingFornecedor.id || isCreating)
  ) : [];

  const handleSwitchChange = (checked) => {
    setEditingFornecedor(prev => ({ ...prev, ativo: checked }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Novo Fornecedor' : 'Editar Fornecedor'}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Adicione um novo fornecedor e vincule itens do estoque.'
              : 'Atualize as informações do fornecedor e os itens vinculados.'
            }
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pt-4">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="dados" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Info className="h-4 w-4 mr-2" />
              Dados do Fornecedor
            </TabsTrigger>
            <TabsTrigger value="itens" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <ListChecks className="h-4 w-4 mr-2" />
              Itens Associados
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dados" className="py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome da Empresa</Label>
                  <Input
                    id="nome"
                    value={editingFornecedor.nome}
                    onChange={(e) => setEditingFornecedor({ ...editingFornecedor, nome: e.target.value })}
                    className="bg-slate-800/50 border-slate-600"
                    placeholder="Nome da empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="contato">Contato (Nome)</Label>
                  <Input
                    id="contato"
                    value={editingFornecedor.contato || ''}
                    onChange={(e) => setEditingFornecedor({ ...editingFornecedor, contato: e.target.value })}
                    className="bg-slate-800/50 border-slate-600"
                    placeholder="Nome do contato"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={editingFornecedor.telefone || ''}
                    onChange={(e) => setEditingFornecedor({ ...editingFornecedor, telefone: e.target.value })}
                    className="bg-slate-800/50 border-slate-600"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={editingFornecedor.endereco || ''}
                    onChange={(e) => setEditingFornecedor({ ...editingFornecedor, endereco: e.target.value })}
                    className="bg-slate-800/50 border-slate-600"
                    placeholder="Rua, Nº, Bairro, Cidade - UF"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <Label htmlFor="lead_time_medio">Lead Time Médio (dias)</Label>
                  <Input
                    id="lead_time_medio"
                    type="number"
                    min="0"
                    value={editingFornecedor.lead_time_medio || 0}
                    onChange={(e) => setEditingFornecedor({ ...editingFornecedor, lead_time_medio: parseInt(e.target.value) || 0 })}
                    className="bg-slate-800/50 border-slate-600"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Power className={`h-5 w-5 ${editingFornecedor.ativo ? 'text-green-500' : 'text-red-500'}`} />
                  <Label htmlFor="ativo-fornecedor-switch" className={editingFornecedor.ativo ? 'text-green-400' : 'text-red-400'}>
                    {editingFornecedor.ativo ? 'Fornecedor Ativo' : 'Fornecedor Inativo'}
                  </Label>
                  <Switch
                    id="ativo-fornecedor-switch"
                    checked={editingFornecedor.ativo === undefined ? true : editingFornecedor.ativo}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="itens" className="py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-4">
              <Button onClick={onOpenNewItemDialog} className="w-full bg-indigo-600 hover:bg-indigo-700 mb-4">
                <PackagePlus className="h-4 w-4 mr-2" />
                Cadastrar Novo Item e Associar Automaticamente
              </Button>
              
              <Label className="block">Vincular Itens Existentes do Estoque</Label>
              <div className="flex items-center space-x-2">
                <Select value={itemParaAdicionar} onValueChange={setItemParaAdicionar}>
                  <SelectTrigger className="flex-grow bg-slate-800/50 border-slate-600">
                    <SelectValue placeholder="Selecione um item do estoque..." />
                  </SelectTrigger>
                  <SelectContent>
                    {itensDisponiveisParaSelecao.length > 0 ? (
                      itensDisponiveisParaSelecao.map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.descricao} ({item.codigo})
                          {item.fornecedor_id && item.fornecedor_id !== editingFornecedor.id && ` (Atual: ${item.fornecedor_nome || 'Desconhecido'})`}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-slate-400">Nenhum item disponível para adicionar.</div>
                    )}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddItemToList} variant="outline" size="icon" className="border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-400">
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>

              <Label className="block mt-4">Itens Associados a este Fornecedor:</Label>
              {selectedItems.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-800/30 rounded-md border border-slate-700">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                      <span className="text-sm">{item.descricao} ({item.codigo})</span>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItemFromList(item.id)} className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-600 rounded-md">
                  {isCreating ? "Nenhum item associado a este novo fornecedor." : "Nenhum item atualmente associado a este fornecedor."}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2"/>
            {isCreating ? 'Criar Fornecedor' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FornecedorDialog;
