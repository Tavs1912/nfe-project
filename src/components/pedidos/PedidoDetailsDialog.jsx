import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, FileText, PackageCheck, CheckCircle, Clock, XCircle, AlertCircle, AlertTriangle } from 'lucide-react';

const PedidoDetailsDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedPedido, 
  isAdmin, 
  onReceberPedido,
  getStatusComAtraso // Passar esta função como prop
}) => {

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Em Aberto':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Aprovado':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'Atendido':
      case 'Recebido':
      case 'Recebido (Atrasado)':
        return <PackageCheck className="h-4 w-4 text-green-500" />;
      case 'Cancelado':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Em Atraso':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Em Aberto':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Aprovado':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Atendido':
      case 'Recebido':
      case 'Recebido (Atrasado)':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Cancelado':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Em Atraso':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // const getTipoColor = (tipo) => {
  //   return tipo === 'Automático' 
  //     ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  //     : 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  // };

  if (!selectedPedido) return null;

  // Use getStatusComAtraso para exibir o status real no diálogo
  const statusRealExibicao = selectedPedido.statusReal || getStatusComAtraso(selectedPedido);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-slate-700 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingCart className="h-6 w-6 mr-2 text-blue-500" />
            Detalhes do Pedido
          </DialogTitle>
          <DialogDescription>
            Informações completas do pedido de reabastecimento.
          </DialogDescription>
        </DialogHeader>
        <>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-sky-400">Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-sm text-slate-400">Número do Pedido</p>
                  <p className="font-mono font-semibold">{selectedPedido.numero}</p>
                </div>
                {/* <div>
                  <p className="text-sm text-slate-400">Tipo</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getTipoColor(selectedPedido.tipo)}`}>
                    {selectedPedido.tipo || 'N/A'}
                  </span>
                </div> */}
                <div>
                  <p className="text-sm text-slate-400">Fornecedor</p>
                  <p className="font-semibold">{selectedPedido.fornecedor_nome || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Data de Criação</p>
                  <p>{new Date(selectedPedido.data_criacao).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(statusRealExibicao)}`}>
                    {getStatusIcon(statusRealExibicao)}
                    <span>{statusRealExibicao}</span>
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total (R$)</p>
                  <p className="font-semibold text-lg">{parseFloat(selectedPedido.valor_total || 0).toFixed(2)}</p>
                </div>
                 {selectedPedido.data_entrega_prevista && (
                    <div>
                        <p className="text-sm text-slate-400">Entrega Prevista</p>
                        <p>{new Date(selectedPedido.data_entrega_prevista).toLocaleDateString('pt-BR')}</p>
                    </div>
                 )}
              </CardContent>
            </Card>
            
            {selectedPedido.observacoes && (
              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-400 flex items-center">
                     <FileText className="h-5 w-5 mr-2"/> Observação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 whitespace-pre-wrap">{selectedPedido.observacoes}</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                 <CardTitle className="text-xl text-lime-400">Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 font-medium text-slate-300">Item ID</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-300">Descrição</th>
                        <th className="text-center py-3 px-4 font-medium text-slate-300">Qtd.</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-300">Vlr. Unit. (R$)</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-300">Subtotal (R$)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPedido.itens_pedido && selectedPedido.itens_pedido.map((item) => (
                        <tr key={item.id || item.item_estoque_id} className="border-b border-slate-800 last:border-b-0 hover:bg-slate-700/30">
                          <td className="py-3 px-4 font-mono text-sm">{item.item_estoque_id}</td>
                          <td className="py-3 px-4">{item.descricao_item}</td>
                          <td className="py-3 px-4 text-center font-semibold">{item.quantidade}</td>
                          <td className="py-3 px-4 text-right">{parseFloat(item.preco_unitario || 0).toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-semibold">{(parseFloat(item.quantidade) * parseFloat(item.preco_unitario || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
            {isAdmin && 
             (statusRealExibicao === 'Em Aberto' || statusRealExibicao === 'Aprovado' || statusRealExibicao === 'Em Atraso') && 
             selectedPedido.status !== 'Recebido' && selectedPedido.status !== 'Atendido' && selectedPedido.status !== 'Cancelado' && (
              <Button onClick={onReceberPedido} className="bg-green-600 hover:bg-green-700">
                <PackageCheck className="h-4 w-4 mr-2" />
                Confirmar Recebimento
              </Button>
            )}
          </DialogFooter>
        </>
      </DialogContent>
    </Dialog>
  );
};

export default PedidoDetailsDialog;