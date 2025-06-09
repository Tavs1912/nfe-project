import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Edit, 
  Shield,
  User,
  Building,
  Mail,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Usuarios = () => {
  const { usuarios, updateUsuariosApp, addAuditLog, fetchData, fornecedores: companiesList } = useData(); // 'usuarios' agora vem de 'profiles'
  const { user, signUp } = useAuth(); // signUp para criar novos usuários
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Mapear 'type' de 'profiles' para 'papel' usado na UI
  const mapProfileToUsuarioUI = (profile) => ({
    ...profile,
    papel: profile.type, // 'type' da tabela profiles é o 'papel'
    empresa: profile.company_id ? companiesList.find(c => c.id === profile.company_id)?.name || 'N/A' : 'N/A', // Nome da empresa
  });

  const uiUsuarios = usuarios.map(mapProfileToUsuarioUI);

  const filteredUsuarios = uiUsuarios.filter(usuario =>
    (usuario.name && usuario.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (usuario.email && usuario.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (usuario.empresa && usuario.empresa.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (usuario) => {
    // 'usuario' aqui é o objeto da UI, precisamos do 'id' do profile
    const profileData = usuarios.find(p => p.id === usuario.id);
    setEditingUsuario({ 
      id: profileData.id,
      name: profileData.name || '',
      email: profileData.email || '',
      type: profileData.type || 'requisitante', // 'type' é o campo no Supabase
      company_id: profileData.company_id || '',
      department_id: profileData.department_id || '',
    });
    setIsCreating(false);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingUsuario({
      name: '',
      email: '',
      type: 'requisitante', // Padrão para 'type'
      company_id: '', 
      department_id: '',
      password: '' // Senha para novo usuário
    });
    setIsCreating(true);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingUsuario) return;
  
    if (!editingUsuario.name || !editingUsuario.email || !editingUsuario.type || (isCreating && !editingUsuario.password)) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome, e-mail, papel e senha (para novos usuários).",
        variant: "destructive",
      });
      return;
    }
  
    if (isCreating) {
      const { name, email, password, type, company_id, department_id } = editingUsuario;
      // O company_id e department_id devem ser UUIDs válidos se fornecidos.
      // Se não houver empresas/departamentos, ou se não forem obrigatórios, podem ser null.
      const signUpData = { 
        nome: name, // Mapeado para 'name' em options.data
        papel: type, // Mapeado para 'type' em options.data
        company_id: company_id || null, 
        department_id: department_id || null 
      };

      const result = await signUp(email, password, signUpData);
  
      if (result.success) {
        addAuditLog(
          'Criação',
          'Usuário',
          `Usuário ${name} (${email}) criado com papel ${type}`,
          null,
          { nome: name, email: email, papel: type }
        );
        toast({
          title: "Usuário criado!",
          description: `${name} foi adicionado com sucesso.`,
        });
        fetchData(); // Recarregar usuários
      } else {
        toast({
          title: "Erro ao criar usuário",
          description: result.error || "Não foi possível criar o usuário.",
          variant: "destructive",
        });
        return; // Não fechar o diálogo se houver erro
      }
    } else {
      // Atualizando um perfil existente
      const originalProfile = usuarios.find(u => u.id === editingUsuario.id);
      const profileToUpdate = {
        id: editingUsuario.id,
        name: editingUsuario.name,
        type: editingUsuario.type,
        company_id: editingUsuario.company_id || null,
        department_id: editingUsuario.department_id || null,
        // Não atualizamos email ou senha aqui, isso é feito por outros fluxos do Supabase Auth
      };
      const updatedProfile = await updateUsuariosApp(profileToUpdate);
      if (updatedProfile) {
        addAuditLog(
          'Edição',
          'Usuário',
          `Usuário ${updatedProfile.name} atualizado`,
          { papel: originalProfile?.type, empresa: originalProfile?.company_id },
          { papel: updatedProfile.type, empresa: updatedProfile.company_id }
        );
        toast({
          title: "Usuário atualizado!",
          description: `${updatedProfile.name} foi atualizado com sucesso.`,
        });
      } else {
         toast({
          title: "Erro ao atualizar usuário",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
        return; 
      }
    }
  
    setIsDialogOpen(false);
    setEditingUsuario(null);
  };

  const getPapelColor = (papel) => {
    switch (papel) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'gestor':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'requisitante':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPapelIcon = (papel) => {
    switch (papel) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'gestor':
        return <UserCheck className="h-4 w-4" />; // Exemplo, pode ser outro ícone
      case 'requisitante':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };
  
  // O 'user' do useAuth() já contém o perfil da tabela 'profiles'
  const isAdmin = user?.type === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="glass-effect border-slate-700 p-8 text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-slate-400">
            Apenas administradores podem acessar a gestão de usuários.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Gestão de Usuários</h1>
            <p className="text-slate-400 mt-2">
              Gerencie usuários e controle de acesso ao sistema (Perfis Supabase)
            </p>
          </div>
          <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
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
                placeholder="Buscar por nome, e-mail ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsuarios.map((usuario, index) => (
          <motion.div
            key={usuario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass-effect border-slate-700 card-hover h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {(usuario.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{usuario.name || 'Usuário sem nome'}</CardTitle>
                      <CardDescription className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{usuario.email}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(usuario)}
                    className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Papel (Type):</span>
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getPapelColor(usuario.papel)}`}>
                    {getPapelIcon(usuario.papel)}
                    <span>{usuario.papel}</span>
                  </span>
                </div>
                
                <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center space-x-2 mb-1">
                    <Building className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-slate-400">Empresa</span>
                  </div>
                  <p className="text-sm font-medium">{usuario.empresa || 'Não associado'}</p>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-effect border-slate-700">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Novo Usuário (Perfil Supabase)' : 'Editar Usuário (Perfil Supabase)'}
            </DialogTitle>
            <DialogDescription>
              {isCreating 
                ? 'Adicione um novo usuário ao sistema (auth e profile)'
                : 'Atualize as informações do perfil do usuário'
              }
            </DialogDescription>
          </DialogHeader>
          {editingUsuario && (
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={editingUsuario.name}
                  onChange={(e) => setEditingUsuario({...editingUsuario, name: e.target.value})}
                  className="bg-slate-800/50 border-slate-600"
                  placeholder="Nome do usuário"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUsuario.email}
                  onChange={(e) => setEditingUsuario({...editingUsuario, email: e.target.value})}
                  className="bg-slate-800/50 border-slate-600"
                  placeholder="usuario@empresa.com"
                  disabled={!isCreating} 
                />
              </div>
              <div>
                <Label htmlFor="type">Papel (Type)</Label>
                <Select 
                  value={editingUsuario.type} 
                  onValueChange={(value) => setEditingUsuario({...editingUsuario, type: value})}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="requisitante">Requisitante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="company_id">Empresa (Company ID)</Label>
                 <Select 
                  value={editingUsuario.company_id || ''} 
                  onValueChange={(value) => setEditingUsuario({...editingUsuario, company_id: value || null})}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-600">
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma</SelectItem>
                    {companiesList.map(company => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isCreating && (
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={editingUsuario.password}
                    onChange={(e) => setEditingUsuario({...editingUsuario, password: e.target.value})}
                    className="bg-slate-800/50 border-slate-600"
                    placeholder="Senha do usuário"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              {isCreating ? 'Criar Usuário' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Usuarios;