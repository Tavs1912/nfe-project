import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye, CheckCircle, Clock, XCircle, AlertCircle, PackageCheck, AlertTriangle } from 'lucide-react';

const PedidoTable = ({ pedidos, onViewDetails }) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="glass-effect border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              <span>Pedidos de Reabastecimento</span>
            </div>
            <span className="text-sm text-slate-400">
              {pedidos.length} pedidos encontrados
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Número</th>
                  {/* <th className="text-center py-3 px-4 font-medium text-slate-300">Tipo</th> */}
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Fornecedor</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-300">Data Criação</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-300">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-300">Total (R$)</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido, index) => (
                  <motion.tr
                    key={pedido.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-sm font-semibold">{pedido.numero}</td>
                    {/* <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getTipoColor(pedido.tipo)}`}>
                        {pedido.tipo || 'N/A'}
                      </span>
                    </td> */}
                    <td className="py-3 px-4">{pedido.fornecedor_nome || 'N/A'}</td>
                    <td className="py-3 px-4 text-center text-slate-400">
                      {new Date(pedido.data_criacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(pedido.statusReal)}`}>
                        {getStatusIcon(pedido.statusReal)}
                        <span>{pedido.statusReal}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">{parseFloat(pedido.valor_total || 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails(pedido)}
                        className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {pedidos.length === 0 && (
            <p className="text-center py-8 text-slate-400">Nenhum pedido encontrado com os filtros aplicados.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PedidoTable;