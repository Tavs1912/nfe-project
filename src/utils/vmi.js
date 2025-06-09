
export const calculateReorderPoint = (leadTime, dailyUsage, safetyStock = 0) => {
  return Math.ceil((leadTime * dailyUsage) + safetyStock);
};

export const shouldReorder = (currentStock, reorderPoint) => {
  return currentStock <= reorderPoint;
};

export const calculateOrderQuantity = (maxStock, currentStock, pendingOrders = 0) => {
  return Math.max(0, maxStock - currentStock - pendingOrders);
};

export const getStockStatus = (currentStock, minStock, maxStock) => {
  const current = Number(currentStock);
  const min = Number(minStock);
  const max = Number(maxStock);

  if (min > 0 && current < min) {
    return { status: 'Crítico', color: 'red', label: 'Crítico' };
  }
  
  if (max > 0 && current > max) {
    return { status: 'Excesso', color: 'purple', label: 'Excesso' };
  }

  // Se min e max são definidos e current está entre eles (ou igual)
  if (min > 0 && max > 0 && current >= min && current <= max) {
     // Para a imagem (atual 2, max 4, status Normal), se min=1, esta condição é Normal.
     // Se quisermos uma faixa de "Atenção":
     // Por exemplo, se estiver nos primeiros 25% acima do mínimo.
     const range = max - min;
     if (range > 0 && current < min + range * 0.25) {
       return { status: 'Atenção', color: 'yellow', label: 'Atenção' };
     }
    return { status: 'Normal', color: 'green', label: 'Normal' };
  }

  // Casos onde min ou max podem não estar bem definidos ou current está "ok"
  // Se apenas min é definido e current >= min
  if (min > 0 && max <= 0 && current >= min) {
    return { status: 'Normal', color: 'green', label: 'Normal' };
  }
  
  // Se apenas max é definido e current <= max
  if (max > 0 && min <= 0 && current <= max) {
    return { status: 'Normal', color: 'green', label: 'Normal' };
  }

  // Se nem min nem max são definidos de forma útil, ou current é 0 e min é 0
  if ((min <= 0 && max <= 0) || (current === 0 && min === 0)) {
     return { status: 'Normal', color: 'green', label: 'Normal' }; // Ou 'Indefinido' se preferir
  }
  
  // Fallback para "Atenção" se não se encaixar claramente,
  // mas isso pode precisar de ajuste fino com base nas regras de negócio.
  // Para o exemplo da imagem, queremos que caia em Normal.
  // A lógica acima deve cobrir o caso da imagem (atual 2, min 1, max 4 -> Normal).
  // Se min não for definido (ou 0), e atual > 0 e <= max, deve ser Normal.
  if (current > 0 && (max <=0 || current <= max)) {
    return { status: 'Normal', color: 'green', label: 'Normal' };
  }


  // Default, pode indicar necessidade de revisão dos parâmetros ou lógica
  return { status: 'Atenção', color: 'yellow', label: 'Atenção' };
};


export const generateAutomaticOrders = (items, suppliers) => {
  const orders = [];
  
  items.forEach(item => {
    if (shouldReorder(item.quantidade_atual, item.pontoPedido)) {
      const supplier = suppliers.find(s => s.id === item.fornecedor_id);
      if (supplier) {
        const quantity = calculateOrderQuantity(
          item.maximo,
          item.quantidade_atual
        );
        
        orders.push({
          id: Date.now() + Math.random(),
          itemId: item.id,
          fornecedorId: supplier.id,
          quantidade: quantity,
          tipo: 'automatico',
          status: 'pendente',
          dataCriacao: new Date().toISOString(),
          previsaoEntrega: new Date(Date.now() + supplier.lead_time_medio * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }
  });
  
  return orders;
};

export const calculateKPIs = (items, orders, suppliers) => {
  const totalItems = items.length;
  const itemsBelowMin = items.filter(item => 
    item.quantidade_atual <= item.minimo
  ).length;
  
  const openOrders = orders.filter(order => 
    order.status === 'pendente' || order.status === 'aprovado'
  ).length;
  
  const avgLeadTime = suppliers.reduce((acc, supplier) => 
    acc + (supplier.lead_time_medio || 0), 0 // Usar lead_time_medio
  ) / suppliers.length || 0;
  
  // Consumo médio não está disponível no item, esta KPI pode não ser calculável diretamente
  const stockTurnover = 0; // Placeholder, pois consumoMedio não existe em item
  
  return {
    totalItems,
    itemsBelowMin,
    openOrders,
    avgLeadTime: Math.round(avgLeadTime),
    stockTurnover: Math.round(stockTurnover * 100) / 100
  };
};
