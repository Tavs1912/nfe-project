import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Plus, Trash2, ShoppingCart, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const PedidoManualForm = ({
  fornecedores,
  estoque,
  onCriarPedido,
  onVoltar,
}) => {
  const [selectedFornecedor, setSelectedFornecedor] = useState("");
  const [itensPedido, setItensPedido] = useState([]);
  const [itemSelecionado, setItemSelecionado] = useState("");
  const [quantidadeItem, setQuantidadeItem] = useState(1);
  const [precoUnitarioItem, setPrecoUnitarioItem] = useState(0);
  const [observacao, setObservacao] = useState("");
  const [itensDisponiveis, setItensDisponiveis] = useState([]);

  useEffect(() => {
    if (selectedFornecedor) {
      const itensDoFornecedor = estoque.filter(
        (item) =>
          item.fornecedor_id &&
          item.fornecedor_id.toString() === selectedFornecedor &&
          item.ativo
      );
      setItensDisponiveis(itensDoFornecedor);
      setItensPedido([]);
      setItemSelecionado("");
      setPrecoUnitarioItem(0);
    } else {
      setItensDisponiveis([]);
    }
  }, [selectedFornecedor, estoque]);

  useEffect(() => {
    if (itemSelecionado) {
      const itemInfo = itensDisponiveis.find(
        (i) => i.codigo === itemSelecionado
      );
      setPrecoUnitarioItem(itemInfo?.precoUnitario || Math.random() * 10 + 1); // Simula preço ou usa o existente
    } else {
      setPrecoUnitarioItem(0);
    }
  }, [itemSelecionado, itensDisponiveis]);

  const handleAddItem = () => {
    if (!itemSelecionado || quantidadeItem <= 0 || precoUnitarioItem <= 0) {
      toast({
        title: "Dados inválidos",
        description:
          "Selecione um item, informe uma quantidade e preço unitário válidos.",
        variant: "destructive",
      });
      return;
    }
    const itemExistente = itensPedido.find((i) => i.codigo === itemSelecionado);
    const itemInfo = itensDisponiveis.find((i) => i.codigo === itemSelecionado);

    if (itemExistente) {
      setItensPedido(
        itensPedido.map((i) =>
          i.codigo === itemSelecionado
            ? {
                ...i,
                quantidade: i.quantidade + quantidadeItem,
                preco_unitario: precoUnitarioItem,
              }
            : i
        )
      );
    } else {
      setItensPedido([
        ...itensPedido,
        {
          item_estoque_id: itemInfo.id,
          codigo: itemInfo.codigo,
          descricao: itemInfo.descricao,
          quantidade: quantidadeItem,
          preco_unitario: precoUnitarioItem,
        },
      ]);
    }
    setItemSelecionado("");
    setQuantidadeItem(1);
    setPrecoUnitarioItem(0);
  };

  const handleRemoveItem = (codigo) => {
    setItensPedido(itensPedido.filter((item) => item.codigo !== codigo));
  };

  const handleFinalizarPedido = () => {
    if (!selectedFornecedor || itensPedido.length === 0) {
      toast({
        title: "Pedido incompleto",
        description: "Selecione um fornecedor e adicione itens ao pedido.",
        variant: "destructive",
      });
      return;
    }
    onCriarPedido(selectedFornecedor, itensPedido, observacao);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-effect border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Edit3 className="h-6 w-6 mr-2 text-orange-400" />
            Criação de Pedido Manual
          </CardTitle>
          <CardDescription>
            Selecione o fornecedor, adicione os itens desejados e observações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="fornecedorManual" className="text-slate-300">
              Fornecedor
            </Label>
            <Select
              value={selectedFornecedor}
              onValueChange={setSelectedFornecedor}
            >
              <SelectTrigger
                id="fornecedorManual"
                className="bg-slate-800/50 border-slate-600"
              >
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {fornecedores
                  .filter((f) => f.ativo)
                  .map((f) => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      {f.nome}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFornecedor && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <Label htmlFor="itemManual" className="text-slate-300">
                    Item
                  </Label>
                  <Select
                    value={itemSelecionado}
                    onValueChange={setItemSelecionado}
                    disabled={itensDisponiveis.length === 0}
                  >
                    <SelectTrigger
                      id="itemManual"
                      className="bg-slate-800/50 border-slate-600"
                    >
                      <SelectValue
                        placeholder={
                          itensDisponiveis.length > 0
                            ? "Selecione um item"
                            : "Nenhum item ativo para este fornecedor"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {itensDisponiveis.map((item) => (
                        <SelectItem key={item.id} value={item.codigo}>
                          {item.descricao} ({item.codigo}) - Estoque:{" "}
                          {item.quantidadeAtual}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantidadeManual" className="text-slate-300">
                    Quantidade
                  </Label>
                  <Input
                    id="quantidadeManual"
                    type="number"
                    min="1"
                    value={quantidadeItem}
                    onChange={(e) =>
                      setQuantidadeItem(parseInt(e.target.value) || 1)
                    }
                    className="bg-slate-800/50 border-slate-600"
                    disabled={!itemSelecionado}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="precoUnitarioManual"
                    className="text-slate-300"
                  >
                    Preço Unit. (R$)
                  </Label>
                  <Input
                    id="precoUnitarioManual"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={precoUnitarioItem}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      // Round to 2 decimal places
                      const roundedValue = Math.round(value * 100) / 100;
                      setPrecoUnitarioItem(roundedValue);
                    }}
                    onBlur={(e) => {
                      // Format to 2 decimal places on blur
                      const value = parseFloat(e.target.value) || 0;
                      const formatted = value.toFixed(2);
                      setPrecoUnitarioItem(parseFloat(formatted));
                    }}
                    className="bg-slate-800/50 border-slate-600"
                    disabled={!itemSelecionado}
                  />
                </div>
              </div>
              <Button
                onClick={handleAddItem}
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={!itemSelecionado || precoUnitarioItem <= 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item ao Pedido
              </Button>
            </>
          )}

          {itensPedido.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-orange-300">
                Itens do Pedido
              </h3>
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {itensPedido.map((item) => (
                  <li
                    key={item.codigo}
                    className="flex justify-between items-center p-3 bg-slate-800/50 rounded-md"
                  >
                    <div>
                      <p className="font-medium">
                        {item.descricao} ({item.codigo})
                      </p>
                      <p className="text-sm text-slate-400">
                        Preço Unit.: R$ {item.preco_unitario.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <p className="font-semibold">Qtd: {item.quantidade}</p>
                      <p className="text-sm text-slate-300">
                        Subtotal: R${" "}
                        {(item.quantidade * item.preco_unitario).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.codigo)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-right mt-2 font-semibold text-lg">
                Total Estimado: R${" "}
                {itensPedido
                  .reduce(
                    (sum, item) => sum + item.quantidade * item.preco_unitario,
                    0
                  )
                  .toFixed(2)}
              </p>
            </div>
          )}

          {itensPedido.length === 0 && selectedFornecedor && (
            <div className="text-center py-4 border border-dashed border-slate-600 rounded-md">
              <ShoppingCart className="h-10 w-10 mx-auto text-slate-500 mb-2" />
              <p className="text-slate-400">
                Nenhum item adicionado ao pedido ainda.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="observacaoManual"
              className="text-slate-300 flex items-center"
            >
              <FileText className="h-4 w-4 mr-2 text-slate-400" />
              Observação (Opcional)
            </Label>
            <Textarea
              id="observacaoManual"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Adicione informações relevantes para este pedido..."
              className="bg-slate-800/50 border-slate-600 min-h-[80px]"
              disabled={!selectedFornecedor}
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onVoltar}>
              Voltar
            </Button>
            <Button
              onClick={handleFinalizarPedido}
              className="bg-orange-600 hover:bg-orange-700"
              disabled={itensPedido.length === 0 || !selectedFornecedor}
            >
              Criar Pedido Manual
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PedidoManualForm;
