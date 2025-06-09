
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PackagePlus, Info, Warehouse, ShoppingCart, Power, DollarSign } from 'lucide-react';

const ItemDialog = ({
  isOpen,
  onOpenChange,
  currentItem,
  setCurrentItem,
  isCreating,
  fornecedores,
  onSave,
  dialogTitle,
  dialogDescription
}) => {
  const effectiveDialogTitle = dialogTitle || (isCreating ? 'Cadastrar Novo Item' : 'Editar Item');
  const effectiveDialogDescription = dialogDescription || (isCreating ? 'Preencha os dados do novo item de estoque.' : 'Atualize as informações do item de estoque.');

  const unidadesPadrao = [
    { value: 'UN', label: 'Unidade (UN)' },
    { value: 'KG', label: 'Quilograma (KG)' },
    { value: 'PC', label: 'Peça (PC)' },
    { value: 'MT', label: 'Metro (MT)' },
    { value: 'LT', label: 'Litro (LT)' },
    { value: 'CX', label: 'Caixa (CX)' },
    { value: 'RL', label: 'Rolo (RL)' },
    { value: 'SC', label: 'Saco (SC)' },
  ];

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setCurrentItem(prev => ({ ...prev, [id]: value }));
  };

  const handleNumberInputChange = (e) => {
    const { id, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
  };

  const handleCurrencyInputChange = (e) => {
    const { id, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    // Round to 2 decimal places
    const roundedValue = Math.round(numericValue * 100) / 100;
    setCurrentItem(prev => ({ ...prev, [id]: roundedValue }));
  };

  const handleCurrencyBlur = (e) => {
    const { id, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    const formatted = numericValue.toFixed(2);
    setCurrentItem(prev => ({ ...prev, [id]: parseFloat(formatted) }));
  };
  
  const handleIntegerInputChange = (e) => {
    const { id, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [id]: parseInt(value) || 0 }));
  };

  const handleSwitchChange = (checked) => {
    setCurrentItem(prev => ({ ...prev, ativo: checked }));
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PackagePlus className="h-6 w-6 mr-2 text-blue-500" />
            {effectiveDialogTitle}
          </DialogTitle>
          <DialogDescription>
            {effectiveDialogDescription}
          </DialogDescription>
        </DialogHeader>
        {currentItem && (
          <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Informações Básicas */}
            <div className="space-y-4 border-b border-slate-700 pb-4">
              <h3 className="text-lg font-semibold flex items-center text-sky-400">
                <Info className="h-5 w-5 mr-2" />
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={currentItem.codigo || ''}
                    onChange={handleInputChange}
                    className="bg-slate-800/50 border-slate-600"
                    disabled={!isCreating && typeof currentItem.id !== 'undefined' && currentItem.id !== 0}
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={currentItem.descricao || ''}
                    onChange={handleInputChange}
                    className="bg-slate-800/50 border-slate-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unidade">Unidade</Label>
                  <Select
                    value={currentItem.unidade || ''}
                    onValueChange={(value) => handleSelectChange('unidade', value)}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600">
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidadesPadrao.map(unidade => (
                        <SelectItem key={unidade.value} value={unidade.value}>
                          {unidade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    value={currentItem.localizacao || ''}
                    onChange={handleInputChange}
                    placeholder="Ex: Corredor A, Prateleira 3"
                    className="bg-slate-800/50 border-slate-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                 <div>
                  <Label htmlFor="valor_unitario" className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-green-400" />
                    Valor Unitário (R$)
                  </Label>
                  <Input
                    id="valor_unitario"
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentItem.valor_unitario || 0}
                    onChange={handleCurrencyInputChange}
                    onBlur={handleCurrencyBlur}
                    className="bg-slate-800/50 border-slate-600"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Power className={`h-5 w-5 ${currentItem.ativo ? 'text-green-500' : 'text-red-500'}`} />
                  <Label htmlFor="ativo-switch" className={currentItem.ativo ? 'text-green-400' : 'text-red-400'}>
                    {currentItem.ativo ? 'Item Ativo' : 'Item Inativo'}
                  </Label>
                  <Switch
                    id="ativo-switch"
                    checked={currentItem.ativo === undefined ? true : currentItem.ativo}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>
              </div>
            </div>

            {/* Informações de Estoque */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center text-lime-400">
                <Warehouse className="h-5 w-5 mr-2" />
                Informações de Estoque
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimo">Estoque Mínimo</Label>
                  <Input
                    id="minimo"
                    type="number"
                    min="0"
                    value={currentItem.minimo || 0}
                    onChange={handleNumberInputChange}
                    className="bg-slate-800/50 border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="maximo">Estoque Máximo</Label>
                  <Input
                    id="maximo"
                    type="number"
                    min="0"
                    value={currentItem.maximo || 0}
                    onChange={handleNumberInputChange}
                    className="bg-slate-800/50 border-slate-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidade_atual">Estoque Atual</Label>
                  <Input
                    id="quantidade_atual" 
                    type="number"
                    min="0"
                    value={currentItem.quantidade_atual || 0}
                    onChange={handleNumberInputChange}
                    className="bg-slate-800/50 border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="lote_reposicao">Lote de Reposição</Label>
                  <Input
                    id="lote_reposicao"
                    type="number"
                    min="0"
                    value={currentItem.lote_reposicao || 0}
                    onChange={handleNumberInputChange}
                    className="bg-slate-800/50 border-slate-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lead_time_entrega">Lead Time de Entrega (dias)</Label>
                  <Input
                    id="lead_time_entrega"
                    type="number"
                    min="0"
                    value={currentItem.lead_time_entrega || 0}
                    onChange={handleIntegerInputChange}
                    className="bg-slate-800/50 border-slate-600"
                  />
                </div>
              </div>
            </div>
            
            {/* Fornecedor */}
             <div className="space-y-4 border-t border-slate-700 pt-4">
                <h3 className="text-lg font-semibold flex items-center text-purple-400">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Fornecedor
                </h3>
                <div>
                  <Label htmlFor="fornecedor_id">Fornecedor Padrão</Label>
                  <Select
                    value={currentItem.fornecedor_id ? currentItem.fornecedor_id.toString() : "nenhum"}
                    onValueChange={(value) => {
                      const newFornecedorId = value === "nenhum" ? null : parseInt(value);
                      handleSelectChange('fornecedor_id', newFornecedorId);
                    }}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600">
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Nenhum</SelectItem>
                      {fornecedores.map(fornecedor => (
                        <SelectItem key={fornecedor.id} value={fornecedor.id.toString()}>
                          {fornecedor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </div>

          </div>
        )}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
            {isCreating ? 'Cadastrar Item' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDialog;
