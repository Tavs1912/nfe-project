
import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const { estoque, pedidos, fornecedores } = useData();

  const itensAbaixoMinimo = estoque.filter(item => item.quantidadeAtual < item.minimo).length;
  const pedidosEmAberto = pedidos.filter(pedido => pedido.status === 'Em Aberto').length;
  const totalItens = estoque.length;
  const totalFornecedores = fornecedores.length;

  const consumoData = [
    { mes: 'Jan', consumo: 1200, reposicao: 1100 },
    { mes: 'Fev', consumo: 1400, reposicao: 1300 },
    { mes: 'Mar', consumo: 1100, reposicao: 1200 },
    { mes: 'Abr', consumo: 1600, reposicao: 1500 },
    { mes: 'Mai', consumo: 1300, reposicao: 1400 },
    { mes: 'Jun', consumo: 1500, reposicao: 1450 },
  ];

  const leadTimeData = [
    { fornecedor: 'Metalúrgica ABC', leadTime: 5 },
    { fornecedor: 'Componentes XYZ', leadTime: 3 },
    { fornecedor: 'Parafusos Tech', leadTime: 7 },
    { fornecedor: 'Industrial Plus', leadTime: 4 },
  ];

  const kpiCards = [
    {
      title: 'Itens Abaixo do Mínimo',
      value: itensAbaixoMinimo,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      trend: '+12%',
      trendUp: false
    },
    {
      title: 'Pedidos em Aberto',
      value: pedidosEmAberto,
      icon: ShoppingCart,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      trend: '-5%',
      trendUp: false
    },
    {
      title: 'Total de Itens',
      value: totalItens,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Fornecedores Ativos',
      value: totalFornecedores,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      trend: '+2%',
      trendUp: true
    }
  ];

  const alertasCriticos = [
    {
      id: 1,
      tipo: 'Estoque Crítico',
      item: 'Porca M6',
      descricao: 'Quantidade atual (80) abaixo do mínimo (100)',
      urgencia: 'Alta'
    },
    {
      id: 2,
      tipo: 'Pedido Atrasado',
      item: 'PED001',
      descricao: 'Pedido em aberto há mais de 5 dias',
      urgencia: 'Média'
    },
    {
      id: 3,
      tipo: 'Reabastecimento',
      item: 'Parafuso M6x20',
      descricao: 'Próximo do ponto de pedido (120)',
      urgencia: 'Baixa'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold gradient-text">Dashboard VMI</h1>
        <p className="text-slate-400 mt-2">
          Visão geral do sistema de gerenciamento de estoque
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="glass-effect border-slate-700 card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">
                        {kpi.title}
                      </p>
                      <p className="text-2xl font-bold text-white mt-2">
                        {kpi.value}
                      </p>
                      <div className="flex items-center mt-2">
                        {kpi.trendUp ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${kpi.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                          {kpi.trend}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                      <Icon className={`h-6 w-6 ${kpi.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consumo vs Reposição */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span>Consumo vs Reposição</span>
              </CardTitle>
              <CardDescription>
                Histórico mensal de consumo e reposição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={consumoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="mes" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="consumo" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Consumo"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reposicao" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Reposição"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lead Time por Fornecedor */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="glass-effect border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <span>Lead Time Médio</span>
              </CardTitle>
              <CardDescription>
                Tempo médio de entrega por fornecedor (dias)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leadTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="fornecedor" 
                    stroke="#9CA3AF"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar 
                    dataKey="leadTime" 
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                    name="Lead Time (dias)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alertas Críticos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="glass-effect border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Alertas Críticos</span>
            </CardTitle>
            <CardDescription>
              Situações que requerem atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertasCriticos.map((alerta, index) => (
                <motion.div
                  key={alerta.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      alerta.urgencia === 'Alta' ? 'bg-red-500' :
                      alerta.urgencia === 'Média' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-white">{alerta.tipo}</p>
                      <p className="text-sm text-slate-400">{alerta.descricao}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{alerta.item}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alerta.urgencia === 'Alta' ? 'bg-red-500/20 text-red-400' :
                      alerta.urgencia === 'Média' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {alerta.urgencia}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
