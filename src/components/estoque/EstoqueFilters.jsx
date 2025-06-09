import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EstoqueFilters = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, fornecedorFilter, setFornecedorFilter, atividadeFilter, setAtividadeFilter, fornecedores }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
  >
    <Card className="glass-effect border-slate-700">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por código ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600">
              <SelectValue placeholder="Status Estoque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Atenção">Atenção</SelectItem>
              <SelectItem value="Crítico">Crítico</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fornecedorFilter} onValueChange={setFornecedorFilter}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600">
              <SelectValue placeholder="Fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Fornecedores</SelectItem>
              <SelectItem value="nenhum">Nenhum</SelectItem>
              {fornecedores.map(fornecedor => (
                <SelectItem key={fornecedor.id} value={fornecedor.id.toString()}>
                  {fornecedor.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={atividadeFilter} onValueChange={setAtividadeFilter}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600">
              <SelectValue placeholder="Atividade do Item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativos">Somente Ativos</SelectItem>
              <SelectItem value="inativos">Somente Inativos</SelectItem>
              <SelectItem value="todos">Todos (Ativos e Inativos)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default EstoqueFilters;