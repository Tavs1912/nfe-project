
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Mail, Building, Clock, Package, Power } from 'lucide-react';

const FornecedorCard = ({ fornecedor, index, onEdit, onViewHistory, onToggleAtivo, isAdmin }) => {
  const isAtivo = fornecedor.ativo === undefined ? true : fornecedor.ativo;

  return (
    <motion.div
      key={fornecedor.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className={`glass-effect border-slate-700 card-hover h-full flex flex-col ${!isAtivo ? 'opacity-60 border-red-500/30' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`h-12 w-12 rounded-full bg-gradient-to-r ${isAtivo ? 'from-blue-500 to-purple-600' : 'from-slate-600 to-slate-700'} flex items-center justify-center`}>
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{fornecedor.nome}</CardTitle>
                <CardDescription className="font-mono text-xs">
                  {fornecedor.cnpj || 'CNPJ não informado'}
                </CardDescription>
              </div>
            </div>
            <div className="flex space-x-1">
              {isAdmin && onToggleAtivo && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onToggleAtivo(fornecedor); }}
                  className={`h-8 w-8 hover:bg-opacity-20 ${isAtivo ? 'text-green-400 hover:bg-green-500' : 'text-red-400 hover:bg-red-500'}`}
                  title={isAtivo ? "Marcar como Inativo" : "Marcar como Ativo"}
                >
                  <Power className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(fornecedor)}
                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Mail className="h-4 w-4" />
            <span>{fornecedor.contato || 'Contato não informado'}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-400">Lead Time</span>
              </div>
              <p className="text-lg font-semibold">{fornecedor.lead_time_medio || 0} dias</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center space-x-2 mb-1">
                <Package className="h-4 w-4 text-green-400" />
                <span className="text-xs text-slate-400">Itens</span>
              </div>
              <p className="text-lg font-semibold">{fornecedor.itensVinculados || 0}</p>
            </div>
          </div>
          {!isAtivo && (
            <p className="text-xs text-center text-red-400 font-semibold mt-2 p-1 bg-red-900/30 rounded">FORNECEDOR INATIVO</p>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full border-slate-600 hover:bg-slate-700"
            onClick={() => onViewHistory(fornecedor)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Histórico
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default FornecedorCard;
