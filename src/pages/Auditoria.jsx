
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar,
  User,
  Edit,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';

const Auditoria = () => {
  const { auditoria } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [acaoFilter, setAcaoFilter] = useState('todas');
  const [entidadeFilter, setEntidadeFilter] = useState('todas');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredAuditoria = auditoria.filter(log => {
    const matchesSearch = log.detalhes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.usuario.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAcao = acaoFilter === 'todas' || log.acao === acaoFilter;const matchesEntidade = entidadeFilter === 'todas' || log.entidade === entidadeFilter;
    
    return matchesSearch && matchesAcao && matchesEntidade;
  });

  const getAcaoIcon = (acao) => {
    switch (acao) {
      case 'criacao':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'edicao':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'exclusao':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAcaoColor = (acao) => {
    switch (acao) {
      case 'criacao':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'edicao':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'exclusao':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Auditoria
          </h1>
          <p className="text-muted-foreground">
            Histórico de alterações e atividades do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-purple-500" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por usuário ou detalhes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={acaoFilter} onValueChange={setAcaoFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as ações</SelectItem>
            <SelectItem value="criacao">Criação</SelectItem>
            <SelectItem value="edicao">Edição</SelectItem>
            <SelectItem value="exclusao">Exclusão</SelectItem>
          </SelectContent>
        </Select>

        <Select value={entidadeFilter} onValueChange={setEntidadeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por entidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as entidades</SelectItem>
            <SelectItem value="estoque">Estoque</SelectItem>
            <SelectItem value="pedido">Pedido</SelectItem>
            <SelectItem value="fornecedor">Fornecedor</SelectItem>
            <SelectItem value="usuario">Usuário</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros Avançados
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Log de Atividades
            </CardTitle>
            <CardDescription>
              {filteredAuditoria.length} registros encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAuditoria.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getAcaoIcon(log.acao)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAcaoColor(log.acao)}`}>
                        {log.acao.charAt(0).toUpperCase() + log.acao.slice(1)}
                      </span>
                    </div>
                    
                    <div>
                      <p className="font-medium">{log.detalhes}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.usuario}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(log.dataHora).toLocaleString('pt-BR')}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {log.entidade}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(log)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Detalhes
                  </Button>
                </motion.div>
              ))}
              
              {filteredAuditoria.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum registro encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Detalhes da Auditoria
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre a atividade registrada
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ação</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getAcaoIcon(selectedLog.acao)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAcaoColor(selectedLog.acao)}`}>
                      {selectedLog.acao.charAt(0).toUpperCase() + selectedLog.acao.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Entidade</label>
                  <p className="mt-1 px-2 py-1 bg-gray-100 rounded text-sm inline-block">
                    {selectedLog.entidade}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Usuário</label>
                  <p className="mt-1">{selectedLog.usuario}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Data/Hora</label>
                  <p className="mt-1">{new Date(selectedLog.dataHora).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Detalhes</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedLog.detalhes}</p>
              </div>
              
              {selectedLog.dadosAnteriores && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Dados Anteriores</label>
                  <pre className="mt-1 p-3 bg-red-50 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(selectedLog.dadosAnteriores, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedLog.dadosNovos && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Dados Novos</label>
                  <pre className="mt-1 p-3 bg-green-50 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(selectedLog.dadosNovos, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auditoria;
