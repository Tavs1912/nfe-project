
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Edit, 
  AlertTriangle,
  CheckCircle,
  AlertCircle, 
  Shield,
  MapPin,
  Box,
  TrendingUp,
  TrendingDown,
  MinusCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { getStockStatus } from '@/utils/vmi';


const EstoqueTable = ({ estoque, isAdmin, onOpenDialog, onToggleAtivo }) => {

  const getVisualStatus = (item) => {
    // Usar item.quantidade_atual, item.minimo, item.maximo que vêm do banco
    const { status, color, label } = getStockStatus(item.quantidade_atual, item.minimo, item.maximo);
    let icon;
    let colorClasses;

    switch (status) {
      case 'Crítico':
        icon = <TrendingDown className="h-4 w-4 text-red-500" />;
        colorClasses = 'bg-red-500/20 text-red-400 border-red-500/30';
        break;
      case 'Atenção':
        icon = <AlertCircle className="h-4 w-4 text-yellow-500" />;
        colorClasses = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        break;
      case 'Excesso':
        icon = <TrendingUp className="h-4 w-4 text-purple-500" />;
        colorClasses = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        break;
      case 'Normal':
      default:
        icon = <CheckCircle className="h-4 w-4 text-green-500" />;
        colorClasses = 'bg-green-500/20 text-green-400 border-green-500/30';
        break;
    }
    return { icon, colorClasses, label };
  };


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
            <Package className="h-5 w-5 text-blue-500" />
            <span>Itens em Estoque</span>
          </div>
          <span className="text-sm text-slate-400">
            {estoque.length} itens encontrados
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 font-medium text-slate-300">Código</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Descrição</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300">Unidade</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300">Localização</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300">Atual</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300">Mín.</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300">Máx.</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Fornecedor</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300">Status Estoque</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300">Ativo</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {estoque.map((item, index) => {
                const visualStatus = getVisualStatus(item);
                const itemAtivo = item.ativo === undefined ? true : item.ativo;
                return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`border-b border-slate-800 hover:bg-slate-800/30 transition-colors ${!itemAtivo ? 'opacity-50 bg-slate-800/50' : ''}`}
                >
                  <td className="py-3 px-4 font-mono text-sm">{item.codigo}</td>
                  <td className="py-3 px-4">{item.descricao}</td>
                  <td className="py-3 px-4 text-center text-slate-400">
                    <Box className="inline h-4 w-4 mr-1 text-slate-500" />
                    {item.unidade || '-'}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">
                    <MapPin className="inline h-4 w-4 mr-1 text-slate-500" />
                    {item.localizacao || '-'}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold">
                    <span className={
                      visualStatus.label === 'Crítico' ? 'text-red-400' : 
                      visualStatus.label === 'Atenção' ? 'text-yellow-400' : 
                      visualStatus.label === 'Excesso' ? 'text-purple-400' :
                      'text-green-400'
                    }>
                      {item.quantidade_atual}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">{item.minimo !== null ? item.minimo : '-'}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{item.maximo !== null ? item.maximo : '-'}</td>
                  <td className="py-3 px-4 text-sm">{item.fornecedor_nome || 'Nenhum'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${visualStatus.colorClasses}`}>
                      {visualStatus.icon}
                      <span>{visualStatus.label}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isAdmin ? (
                       <Switch
                        checked={itemAtivo}
                        onCheckedChange={() => onToggleAtivo(item)} // Passar o item inteiro
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                      />
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs ${itemAtivo ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'}`}>
                        {itemAtivo ? 'Ativo' : 'Inativo'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onOpenDialog(item)}
                          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )})}
            </tbody>
          </table>
        </div>
        {!isAdmin && estoque.length > 0 && (
          <p className="text-xs text-slate-500 mt-4 text-center">
            <Shield className="inline h-3 w-3 mr-1" />
            Apenas administradores podem editar itens.
          </p>
        )}
        {estoque.length === 0 && (
           <p className="text-slate-400 text-center py-8">Nenhum item encontrado.</p>
        )}
      </CardContent>
    </Card>
  </motion.div>
  )};

export default EstoqueTable;
