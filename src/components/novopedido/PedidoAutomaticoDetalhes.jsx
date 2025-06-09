import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Zap, ShoppingCart, FileText } from "lucide-react";

const PedidoAutomaticoDetalhes = ({
  itensParaPedido,
  fornecedores,
  onCriarPedidos,
  onVoltar,
}) => {
  const [observacao, setObservacao] = useState("");

  const handleCriarPedidosComObservacao = () => {
    onCriarPedidos(observacao);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-effect border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-6 w-6 mr-2 text-purple-400" />
            Revisão do Pedido Automático
          </CardTitle>
          <CardDescription>
            Estes são os itens que o sistema identificou para reposição
            automática, considerando o lote de reposição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {itensParaPedido.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {Object.entries(
                itensParaPedido.reduce((acc, item) => {
                  const fornecedorNome =
                    fornecedores.find((f) => f.id === item.fornecedor_id)
                      ?.nome || "Fornecedor Desconhecido";
                  if (!acc[fornecedorNome]) acc[fornecedorNome] = [];
                  acc[fornecedorNome].push(item);
                  return acc;
                }, {})
              ).map(([fornecedor, itens]) => (
                <div key={fornecedor}>
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">
                    {fornecedor}
                  </h3>
                  <ul className="space-y-2">
                    {itens.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-slate-800/50 rounded-md"
                      >
                        <div>
                          <p className="font-medium">
                            {item.descricao} ({item.codigo})
                          </p>
                          <p className="text-sm text-slate-400">
                            Atual: {item.quantidadeAtual}, Mín: {item.minimo},
                            Máx: {item.maximo}, Lote: {item.loteReposicao}, V.
                            Unit.: R$ {item.precoUnitario?.toFixed(2) || "N/A"}
                          </p>
                        </div>
                        <p className="font-semibold text-purple-400">
                          Pedir: {item.quantidadePedir}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-16 w-16 mx-auto text-slate-500 mb-4" />
              <p className="text-xl font-semibold">Tudo em ordem!</p>
              <p className="text-slate-400">
                Nenhum item precisa de reposição automática no momento.
              </p>
            </div>
          )}

          {itensParaPedido.length > 0 && (
            <div className="mt-6 space-y-4">
              <div>
                <Label
                  htmlFor="observacaoAutomatica"
                  className="text-slate-300 flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2 text-slate-400" />
                  Observação (Opcional)
                </Label>
                <Textarea
                  id="observacaoAutomatica"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Adicione informações relevantes para este(s) pedido(s)..."
                  className="bg-slate-800/50 border-slate-600 min-h-[80px]"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onVoltar}>
              Voltar
            </Button>
            {itensParaPedido.length > 0 && (
              <Button
                onClick={handleCriarPedidosComObservacao}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Criar Pedidos Automáticos
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PedidoAutomaticoDetalhes;
