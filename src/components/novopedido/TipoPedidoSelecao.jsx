
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Edit3 } from 'lucide-react';

const TipoPedidoSelecao = ({ onSelectTipo }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="grid md:grid-cols-2 gap-8"
    >
      <Card 
        onClick={() => onSelectTipo('automatico')}
        className="glass-effect border-slate-700 hover:border-purple-500 transition-all cursor-pointer transform hover:scale-105"
      >
        <CardHeader className="items-center">
          <Zap className="h-12 w-12 text-purple-400 mb-4" />
          <CardTitle className="text-2xl">Pedido Automático</CardTitle>
          <CardDescription className="text-center text-slate-400">
            O sistema identifica itens em ponto de reposição e gera os pedidos automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button className="bg-purple-600 hover:bg-purple-700">Selecionar Automático</Button>
        </CardContent>
      </Card>
      <Card 
        onClick={() => onSelectTipo('manual')}
        className="glass-effect border-slate-700 hover:border-orange-500 transition-all cursor-pointer transform hover:scale-105"
      >
        <CardHeader className="items-center">
          <Edit3 className="h-12 w-12 text-orange-400 mb-4" />
          <CardTitle className="text-2xl">Pedido Manual</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Você seleciona os itens, quantidades e o fornecedor para criar o pedido.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button className="bg-orange-600 hover:bg-orange-700">Selecionar Manual</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TipoPedidoSelecao;
