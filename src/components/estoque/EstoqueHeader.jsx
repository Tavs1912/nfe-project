
import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EstoqueHeader = ({ isAdmin, onOpenDialog }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-center justify-between"
  >
    <div>
      <h1 className="text-3xl font-bold gradient-text">Gestão de Estoque</h1>
      <p className="text-slate-400 mt-2">
        Monitore e gerencie os níveis de estoque dos produtos
      </p>
    </div>
    {isAdmin && (
      <Button onClick={() => onOpenDialog()} className="bg-green-600 hover:bg-green-700">
        <Plus className="h-4 w-4 mr-2" />
        Cadastrar Item
      </Button>
    )}
  </motion.div>
);

export default EstoqueHeader;
