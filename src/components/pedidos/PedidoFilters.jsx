import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

const PedidoFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  fornecedorFilter,
  setFornecedorFilter,
  fornecedores,
  tipoFilter,
  setTipoFilter
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="glass-effect border-slate-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nº, fornecedor, obs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="Em Aberto">Em Aberto</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Recebido">Recebido</SelectItem>
                <SelectItem value="Atendido">Atendido</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
                <SelectItem value="Em Atraso">Em Atraso</SelectItem>
                <SelectItem value="Recebido (Atrasado)">Recebido (Atrasado)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={fornecedorFilter} onValueChange={setFornecedorFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600">
                <SelectValue placeholder="Fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Fornecedores</SelectItem>
                {fornecedores.map(fornecedor => (
                  <SelectItem key={fornecedor.id} value={fornecedor.id.toString()}>
                    {fornecedor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600">
                <SelectValue placeholder="Tipo de Pedido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="Automático">Automático</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PedidoFilters;