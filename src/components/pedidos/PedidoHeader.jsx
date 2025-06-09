import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const PedidoHeader = ({ onNovoPedido }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold gradient-text">Gestão de Pedidos</h1>
        <p className="text-slate-400 mt-2">
          Acompanhe pedidos automáticos e manuais de reabastecimento
        </p>
      </div>
      <Button onClick={onNovoPedido} className="bg-green-600 hover:bg-green-700">
        <Plus className="h-4 w-4 mr-2" />
        Novo Pedido
      </Button>
    </motion.div>
  );
};

export default PedidoHeader;