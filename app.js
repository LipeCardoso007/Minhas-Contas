const meses = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const STORAGE_KEY = "minhas-contas-2026";
const CATEGORY_KEY = "minhas-categorias-2026";
const SALARY_KEY = "minhas-contas-salario-2026";
const THEME_KEY = "minhas-contas-tema-2026";

const form = document.getElementById("contaForm");
const mesesContainer = document.getElementById("meses");
const totalAno = document.getElementById("totalAno");
const totalFixosMes = document.getElementById("totalFixosMes");
const salarioMes = document.getElementById("salarioMes");
const saldoMes = document.getElementById("saldoMes");
const limparTudo = document.getElementById("limparTudo");
const selectMes = document.getElementById("mesInicial");
const categoriaSelect = document.getElementById("categoriaSelect");
const graficoPizza = document.getElementById("graficoPizza");
const graficoLegenda = document.getElementById("graficoLegenda");
const graficoTooltip = document.getElementById("graficoTooltip");
const modalConta = document.getElementById("modalConta");
const abrirModal = document.getElementById("abrirModal");
const fecharModal = document.getElementById("fecharModal");
const tituloModal = document.getElementById("tituloModal");
let editandoId = null;
const modalCategorias = document.getElementById("modalCategorias");
const abrirCategoria = document.getElementById("abrirCategoria");
const verCategorias = document.getElementById("verCategorias");
const fecharCategorias = document.getElementById("fecharCategorias");
const categoriaForm = document.getElementById("categoriaForm");
const categoriaNome = document.getElementById("categoriaNome");
const listaCategorias = document.getElementById("listaCategorias");
const parcelasInput = document.getElementById("parcelas");
const valorParcelaInput = document.getElementById("valorParcela");
const valorTotalInput = document.getElementById("valorTotal");
const fixoInput = document.getElementById("fixo");
const salvarBackup = document.getElementById("salvarBackup");
const restaurarBackup = document.getElementById("restaurarBackup");
const backupInput = document.getElementById("backupInput");
const toastAviso = document.getElementById("toastAviso");
let toastTimer = null;
const modalSalario = document.getElementById("modalSalario");
const abrirSalario = document.getElementById("abrirSalario");
const fecharSalario = document.getElementById("fecharSalario");
const salarioForm = document.getElementById("salarioForm");
const salarioInput = document.getElementById("salarioInput");
const modalTema = document.getElementById("modalTema");
const abrirTema = document.getElementById("abrirTema");
const fecharTema = document.getElementById("fecharTema");
const temaModo = document.getElementById("temaModo");
const temaCor = document.getElementById("temaCor");

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function parseValorReal(valorTexto) {
  const limpo = String(valorTexto || "").replace(/\D/g, "");
  const numero = Number(limpo) / 100;
  return Number.isNaN(numero) ? 0 : numero;
}

function formatarValorInput(input) {
  const numero = parseValorReal(input.value);
  if (!numero) {
    input.value = "";
    return;
  }
  input.value = numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function atualizarTotalCalculado() {
  const valorParcela = parseValorReal(valorParcelaInput.value);
  const parcelas = Math.max(1, Number(parcelasInput.value));
  const total = valorParcela * parcelas;
  if (!total) {
    valorTotalInput.value = "";
    return;
  }
  valorTotalInput.value = total.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function aplicarEstadoFixo() {
  const fixo = fixoInput.checked;
  parcelasInput.disabled = fixo;
  if (fixo) {
    parcelasInput.value = "1";
  }
  atualizarTotalCalculado();
}
function carregarContas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function salvarContas(contas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contas));
}

function carregarCategorias() {
  try {
    const raw = localStorage.getItem(CATEGORY_KEY);
    return raw ? JSON.parse(raw) : ["Geral"];
  } catch (error) {
    return ["Geral"];
  }
}

function salvarCategorias(categorias) {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categorias));
}

function carregarSalario() {
  const raw = localStorage.getItem(SALARY_KEY);
  const valor = Number(raw);
  return Number.isNaN(valor) ? 0 : valor;
}

function salvarSalario(valor) {
  localStorage.setItem(SALARY_KEY, String(valor));
}

function carregarTema() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (!raw) return { mode: "dark", accent: "green" };
    const tema = JSON.parse(raw);
    const acentosValidos = ["green", "blue", "orange", "red"];
    return {
      mode: tema.mode === "light" ? "light" : "dark",
      accent: acentosValidos.includes(tema.accent) ? tema.accent : "green",
    };
  } catch (error) {
    return { mode: "dark", accent: "green" };
  }
}

function salvarTema(tema) {
  localStorage.setItem(THEME_KEY, JSON.stringify(tema));
}

function atualizarBotoesTema(tema) {
  temaModo.querySelectorAll(".theme-option").forEach((botao) => {
    botao.classList.toggle("active", botao.dataset.mode === tema.mode);
  });
  temaCor.querySelectorAll(".theme-option").forEach((botao) => {
    botao.classList.toggle("active", botao.dataset.accent === tema.accent);
  });
}

function aplicarTema(tema) {
  document.body.dataset.mode = tema.mode;
  document.body.dataset.accent = tema.accent;
  atualizarBotoesTema(tema);
}

function gerarBackup() {
  return {
    contas: carregarContas(),
    categorias: carregarCategorias(),
    salario: carregarSalario(),
    criadoEm: new Date().toISOString(),
  };
}

function aplicarBackup(backup) {
  if (!backup || !Array.isArray(backup.contas) || !Array.isArray(backup.categorias)) {
    return false;
  }
  salvarContas(backup.contas);
  salvarCategorias(backup.categorias);
  if (typeof backup.salario === "number") {
    salvarSalario(backup.salario);
  }
  return true;
}

function mostrarToast(mensagem) {
  toastAviso.textContent = mensagem;
  toastAviso.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastAviso.classList.remove("show");
  }, 2400);
}

function criarMeses() {
  selectMes.innerHTML = meses
    .map((mes, index) => `<option value="${index}">${mes}</option>`)
    .join("");
}

function renderizarCategorias() {
  const categorias = carregarCategorias();
  categoriaSelect.innerHTML = categorias
    .map((categoria) => `<option value="${categoria}">${categoria}</option>`)
    .join("");
}

function normalizarCategoria(nome) {
  return nome.trim();
}

function atualizarCategoriaEmContas(antiga, nova) {
  const contas = carregarContas();
  const atualizadas = contas.map((conta) => {
    if (conta.categoria === antiga) {
      return { ...conta, categoria: nova };
    }
    return conta;
  });
  salvarContas(atualizadas);
}

function removerCategoriaDasContas(nome) {
  const contas = carregarContas();
  const atualizadas = contas.map((conta) => {
    if (conta.categoria === nome) {
      return { ...conta, categoria: "Geral" };
    }
    return conta;
  });
  salvarContas(atualizadas);
}

function renderizarListaCategorias() {
  const categorias = carregarCategorias();
  listaCategorias.innerHTML = categorias
    .map(
      (categoria) => `
        <div class="categoria-item" data-nome="${categoria}">
          <input type="text" value="${categoria}" />
          <button class="ghost" data-acao="salvar">Salvar</button>
          <button class="ghost" data-acao="excluir">Excluir</button>
        </div>
      `
    )
    .join("");
}

function distribuirParcelas(conta) {
  if (conta.fixo) {
    const parcelas = [];
    for (let mesIndex = conta.mesInicial; mesIndex <= 11; mesIndex += 1) {
      parcelas.push({
        id: conta.id,
        mesIndex,
        descricao: conta.nome,
        valor: conta.valorTotal,
        parcelaAtual: 1,
        parcelaTotal: 1,
        fixo: true,
        categoria: conta.categoria,
      });
    }
    return parcelas;
  }

  const parcelas = [];
  const valorParcela = conta.valorTotal / conta.parcelas;
  for (let i = 0; i < conta.parcelas; i += 1) {
    const mesIndex = conta.mesInicial + i;
    if (mesIndex > 11) break;
    parcelas.push({
      id: conta.id,
      mesIndex,
      descricao: conta.nome,
      valor: valorParcela,
      parcelaAtual: i + 1,
      parcelaTotal: conta.parcelas,
      fixo: false,
      categoria: conta.categoria,
    });
  }
  return parcelas;
}

function agruparPorMes(contas) {
  const mesesAgrupados = meses.map(() => []);
  contas.forEach((conta) => {
    distribuirParcelas(conta).forEach((parcela) => {
      mesesAgrupados[parcela.mesIndex].push(parcela);
    });
  });
  return mesesAgrupados;
}

function atualizarResumo(mesesAgrupados, mesAtual) {
  let total = 0;
  mesesAgrupados.forEach((lista) => {
    lista.forEach((parcela) => {
      total += parcela.valor;
    });
  });
  totalAno.textContent = formatoMoeda.format(total);
  const fixosDoMes = mesesAgrupados[mesAtual]
    ? mesesAgrupados[mesAtual].filter((parcela) => parcela.fixo)
    : [];
  const totalFixos = fixosDoMes.reduce((acc, item) => acc + item.valor, 0);
  totalFixosMes.textContent = formatoMoeda.format(totalFixos);
  const totalMesAtual = mesesAgrupados[mesAtual]
    ? mesesAgrupados[mesAtual].reduce((acc, item) => acc + item.valor, 0)
    : 0;
  const salarioAtual = carregarSalario();
  salarioMes.textContent = formatoMoeda.format(salarioAtual);
  saldoMes.textContent = formatoMoeda.format(salarioAtual - totalMesAtual);
}

function calcularTotaisPorCategoria(listaParcelas) {
  const totais = {};
  listaParcelas.forEach((parcela) => {
    const categoria = parcela.categoria || "Geral";
    totais[categoria] = (totais[categoria] || 0) + parcela.valor;
  });
  return totais;
}

function coresCategoria(indice, total) {
  const hue = Math.round((indice / Math.max(1, total)) * 280 + 90);
  return {
    base: `hsl(${hue}, 65%, 55%)`,
    light: `hsl(${hue}, 70%, 66%)`,
    dark: `hsl(${hue}, 65%, 40%)`,
  };
}

function criarGradientePizza(ctx, cores) {
  const gradiente = ctx.createRadialGradient(120, 120, 20, 120, 120, 90);
  gradiente.addColorStop(0, cores.light);
  gradiente.addColorStop(0.55, cores.base);
  gradiente.addColorStop(1, cores.dark);
  return gradiente;
}

function renderizarGrafico(listaParcelas) {
  const ctx = graficoPizza.getContext("2d");
  const totais = calcularTotaisPorCategoria(listaParcelas);
  const categorias = Object.keys(totais);
  const valores = categorias.map((categoria) => totais[categoria]);
  const total = valores.reduce((acc, val) => acc + val, 0);
  const slices = [];

  ctx.clearRect(0, 0, graficoPizza.width, graficoPizza.height);

  if (total <= 0) {
    ctx.beginPath();
    ctx.arc(120, 120, 90, 0, Math.PI * 2);
    ctx.fillStyle = "#0f2b1c";
    ctx.fill();
    graficoLegenda.innerHTML = "<div>Nenhum gasto cadastrado.</div>";
    graficoPizza.dataset.slices = "[]";
    graficoTooltip.classList.remove("visible");
    return;
  }

  let inicio = -Math.PI / 2;
  graficoLegenda.innerHTML = categorias
    .map((categoria, index) => {
      const cor = coresCategoria(index, categorias.length);
      const percentual = ((totais[categoria] / total) * 100).toFixed(1);
      const valor = formatoMoeda.format(totais[categoria]);
      return `
        <div class="legend-item">
          <span class="legend-swatch" style="background:${cor.base}"></span>
          <span>${categoria} - ${percentual}% (${valor})</span>
        </div>
      `;
    })
    .join("");

  categorias.forEach((categoria, index) => {
    const valor = totais[categoria];
    const angulo = (valor / total) * Math.PI * 2;
    const cor = coresCategoria(index, categorias.length);
    slices.push({
      categoria,
      valor,
      cor: cor.base,
      inicio,
      fim: inicio + angulo,
      percentual: ((valor / total) * 100).toFixed(1),
    });
    ctx.beginPath();
    ctx.moveTo(120, 120);
    ctx.arc(120, 120, 90, inicio, inicio + angulo);
    ctx.closePath();
    ctx.fillStyle = criarGradientePizza(ctx, cor);
    ctx.fill();
    inicio += angulo;
  });

  graficoPizza.dataset.slices = JSON.stringify(slices);
}

function renderizar() {
  const contas = carregarContas();
  const mesesAgrupados = agruparPorMes(contas);
  const mesAtual = new Date().getMonth();

  mesesContainer.innerHTML = mesesAgrupados
    .map((lista, index) => {
      const totalMes = lista.reduce((acc, item) => acc + item.valor, 0);
      const classes = [
        "mes",
        index === mesAtual ? "current" : "collapsed",
      ].join(" ");
      const itens = lista.length
        ? lista
            .map(
              (item) => `
            <div class="conta-item" data-id="${item.id}">
              <span>${item.descricao} <small>(${item.parcelaAtual}/${item.parcelaTotal})</small> ${
                item.fixo ? "<small>FIXO</small>" : ""
              } <span class="conta-tag">${item.categoria || "Geral"}</span></span>
              <strong>${formatoMoeda.format(item.valor)}</strong>
            </div>
          `
            )
            .join("")
        : `<div class="conta-item"><span>Nenhuma conta cadastrada</span><strong>-</strong></div>`;

      return `
        <article class="${classes}" data-mes="${index}">
          <div class="mes-header" role="button" tabindex="0">
            <h3>${meses[index]}</h3>
            <div class="mes-total">${formatoMoeda.format(totalMes)}</div>
          </div>
          <div class="contas">${itens}</div>
        </article>
      `;
    })
    .join("");

  atualizarResumo(mesesAgrupados, mesAtual);
  renderizarGrafico(mesesAgrupados[mesAtual] || []);
}

function detectarSlice(event) {
  const rect = graficoPizza.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const dx = x - 120;
  const dy = y - 120;
  const distancia = Math.sqrt(dx * dx + dy * dy);
  if (distancia > 90) return null;
  let angulo = Math.atan2(dy, dx);
  if (angulo < -Math.PI / 2) angulo += Math.PI * 2;
  const slices = JSON.parse(graficoPizza.dataset.slices || "[]");
  return slices.find((slice) => angulo >= slice.inicio && angulo <= slice.fim);
}

function mostrarTooltip(event) {
  const slice = detectarSlice(event);
  if (!slice) {
    graficoTooltip.classList.remove("visible");
    return;
  }
  const valor = formatoMoeda.format(slice.valor);
  graficoTooltip.textContent = `${slice.categoria} - ${slice.percentual}% (${valor})`;
  const rect = graficoPizza.getBoundingClientRect();
  const x = event.clientX - rect.left + 10;
  const y = event.clientY - rect.top + 10;
  graficoTooltip.style.left = `${x}px`;
  graficoTooltip.style.top = `${y}px`;
  graficoTooltip.classList.add("visible");
}

function abrirModalConta() {
  if (!editandoId) {
    form.reset();
    document.getElementById("parcelas").value = "1";
    document.getElementById("fixo").checked = false;
    document.getElementById("categoriaNova").value = "";
    renderizarCategorias();
    categoriaSelect.value = categoriaSelect.options[0]?.value || "Geral";
    tituloModal.textContent = "Adicionar conta";
  }
  atualizarTotalCalculado();
  aplicarEstadoFixo();
  modalConta.classList.add("open");
  modalConta.setAttribute("aria-hidden", "false");
  document.getElementById("nome").focus();
}

function abrirModalSalario() {
  const salario = carregarSalario();
  salarioInput.value = salario
    ? salario.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "";
  modalSalario.classList.add("open");
  modalSalario.setAttribute("aria-hidden", "false");
  salarioInput.focus();
}

function abrirModalTema() {
  modalTema.classList.add("open");
  modalTema.setAttribute("aria-hidden", "false");
}

function fecharModalTema() {
  modalTema.classList.remove("open");
  modalTema.setAttribute("aria-hidden", "true");
}

function fecharModalSalario() {
  modalSalario.classList.remove("open");
  modalSalario.setAttribute("aria-hidden", "true");
  salarioForm.reset();
}
function abrirModalCategorias() {
  modalCategorias.classList.add("open");
  modalCategorias.setAttribute("aria-hidden", "false");
  renderizarListaCategorias();
  categoriaNome.focus();
}

function fecharModalCategorias() {
  modalCategorias.classList.remove("open");
  modalCategorias.setAttribute("aria-hidden", "true");
  categoriaForm.reset();
}

function abrirModalEdicao(conta) {
  editandoId = conta.id;
  tituloModal.textContent = "Editar conta";
  document.getElementById("nome").value = conta.nome;
  const valorParcela = conta.parcelas ? conta.valorTotal / conta.parcelas : 0;
  valorParcelaInput.value = valorParcela
    ? valorParcela.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "";
  document.getElementById("mesInicial").value = conta.mesInicial;
  document.getElementById("parcelas").value = conta.parcelas;
  document.getElementById("fixo").checked = conta.fixo;
  const categorias = carregarCategorias();
  if (conta.categoria && !categorias.includes(conta.categoria)) {
    categorias.push(conta.categoria);
    salvarCategorias(categorias);
    renderizarCategorias();
  }
  categoriaSelect.value = conta.categoria || "Geral";
  document.getElementById("categoriaNova").value = "";
  aplicarEstadoFixo();
  atualizarTotalCalculado();
  abrirModalConta();
}

function fecharModalConta() {
  modalConta.classList.remove("open");
  modalConta.setAttribute("aria-hidden", "true");
  tituloModal.textContent = "Adicionar conta";
  editandoId = null;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const valorParcela = parseValorReal(document.getElementById("valorParcela").value);
  const mesInicial = Number(document.getElementById("mesInicial").value);
  const parcelas = Math.max(1, Number(document.getElementById("parcelas").value));
  const fixo = document.getElementById("fixo").checked;
  const categoriaNova = document.getElementById("categoriaNova").value.trim();
  let categoria = categoriaSelect.value;
  const valorTotal = valorParcela * parcelas;

  if (!nome || Number.isNaN(valorParcela) || valorParcela <= 0) {
    return;
  }

  if (categoriaNova) {
    const categorias = carregarCategorias();
    const existe = categorias.some(
      (item) => item.toLowerCase() === categoriaNova.toLowerCase()
    );
    if (!existe) {
      categorias.push(categoriaNova);
      salvarCategorias(categorias);
    }
    categoria = categoriaNova;
  }

  const contas = carregarContas();
  if (editandoId) {
    const indice = contas.findIndex((conta) => conta.id === editandoId);
    if (indice !== -1) {
      contas[indice] = {
        ...contas[indice],
        nome,
        valorTotal,
        mesInicial,
        parcelas,
        fixo,
        categoria,
      };
    }
  } else {
    contas.push({
      id: crypto.randomUUID(),
      nome,
      valorTotal,
      mesInicial,
      parcelas,
      fixo,
      categoria,
    });
  }

  salvarContas(contas);
  form.reset();
  document.getElementById("parcelas").value = "1";
  renderizarCategorias();
  renderizar();
  fecharModalConta();
});

valorParcelaInput.addEventListener("input", () => {
  formatarValorInput(valorParcelaInput);
  atualizarTotalCalculado();
});
parcelasInput.addEventListener("input", atualizarTotalCalculado);
fixoInput.addEventListener("change", aplicarEstadoFixo);

categoriaForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nome = normalizarCategoria(categoriaNome.value);
  if (!nome) return;
  const categorias = carregarCategorias();
  const existe = categorias.some(
    (item) => item.toLowerCase() === nome.toLowerCase()
  );
  if (!existe) {
    categorias.push(nome);
    salvarCategorias(categorias);
  }
  categoriaForm.reset();
  renderizarCategorias();
  renderizarListaCategorias();
});

salarioForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const valor = parseValorReal(salarioInput.value);
  if (!valor) return;
  salvarSalario(valor);
  fecharModalSalario();
  renderizar();
  mostrarToast("Salario salvo.");
});

mesesContainer.addEventListener("click", (event) => {
  const conta = event.target.closest(".conta-item");
  if (conta && conta.dataset.id) {
    const contas = carregarContas();
    const alvo = contas.find((item) => item.id === conta.dataset.id);
    if (alvo) {
      abrirModalEdicao(alvo);
    }
    return;
  }
  const header = event.target.closest(".mes-header");
  if (!header) return;
  const mes = header.closest(".mes");
  if (!mes) return;
  mes.classList.toggle("collapsed");
});

mesesContainer.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const header = event.target.closest(".mes-header");
  if (!header) return;
  const mes = header.closest(".mes");
  if (!mes) return;
  mes.classList.toggle("collapsed");
});

limparTudo.addEventListener("click", () => {
  salvarContas([]);
  renderizar();
});

graficoPizza.addEventListener("mousemove", mostrarTooltip);
graficoPizza.addEventListener("mouseleave", () => {
  graficoTooltip.classList.remove("visible");
});

abrirModal.addEventListener("click", abrirModalConta);
fecharModal.addEventListener("click", fecharModalConta);
modalConta.addEventListener("click", (event) => {
  if (event.target.dataset.fechar) {
    fecharModalConta();
  }
});

abrirCategoria.addEventListener("click", abrirModalCategorias);
verCategorias.addEventListener("click", abrirModalCategorias);
fecharCategorias.addEventListener("click", fecharModalCategorias);
modalCategorias.addEventListener("click", (event) => {
  if (event.target.dataset.fecharCategoria) {
    fecharModalCategorias();
  }
});

listaCategorias.addEventListener("click", (event) => {
  const item = event.target.closest(".categoria-item");
  if (!item) return;
  const acao = event.target.dataset.acao;
  if (!acao) return;
  const input = item.querySelector("input");
  const nomeAtual = item.dataset.nome;
  const nomeNovo = normalizarCategoria(input.value);
  if (acao === "salvar") {
    if (!nomeNovo) return;
    const categorias = carregarCategorias();
    const jaExiste = categorias.some(
      (cat) => cat.toLowerCase() === nomeNovo.toLowerCase()
    );
    if (jaExiste && nomeNovo.toLowerCase() !== nomeAtual.toLowerCase()) {
      input.value = nomeAtual;
      return;
    }
    const atualizadas = categorias.map((cat) =>
      cat === nomeAtual ? nomeNovo : cat
    );
    salvarCategorias(atualizadas);
    atualizarCategoriaEmContas(nomeAtual, nomeNovo);
    renderizarCategorias();
    renderizarListaCategorias();
    renderizar();
  }
  if (acao === "excluir") {
    if (nomeAtual === "Geral") return;
    const confirmar = window.confirm(
      `Excluir a categoria "${nomeAtual}"? As contas vao virar "Geral".`
    );
    if (!confirmar) return;
    const categorias = carregarCategorias().filter((cat) => cat !== nomeAtual);
    if (!categorias.includes("Geral")) categorias.unshift("Geral");
    salvarCategorias(categorias);
    removerCategoriaDasContas(nomeAtual);
    renderizarCategorias();
    renderizarListaCategorias();
    renderizar();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalConta.classList.contains("open")) {
    fecharModalConta();
  }
  if (event.key === "Escape" && modalCategorias.classList.contains("open")) {
    fecharModalCategorias();
  }
  if (event.key === "Escape" && modalSalario.classList.contains("open")) {
    fecharModalSalario();
  }
  if (event.key === "Escape" && modalTema.classList.contains("open")) {
    fecharModalTema();
  }
});

abrirSalario.addEventListener("click", abrirModalSalario);
fecharSalario.addEventListener("click", fecharModalSalario);
modalSalario.addEventListener("click", (event) => {
  if (event.target.dataset.fecharSalario) {
    fecharModalSalario();
  }
});

abrirTema.addEventListener("click", abrirModalTema);
fecharTema.addEventListener("click", fecharModalTema);
modalTema.addEventListener("click", (event) => {
  if (event.target.dataset.fecharTema) {
    fecharModalTema();
  }
});

temaModo.addEventListener("click", (event) => {
  const botao = event.target.closest(".theme-option");
  if (!botao) return;
  const tema = carregarTema();
  tema.mode = botao.dataset.mode === "light" ? "light" : "dark";
  salvarTema(tema);
  aplicarTema(tema);
});

temaCor.addEventListener("click", (event) => {
  const botao = event.target.closest(".theme-option");
  if (!botao) return;
  const tema = carregarTema();
  tema.accent = botao.dataset.accent || "green";
  salvarTema(tema);
  aplicarTema(tema);
});

salarioInput.addEventListener("input", () => {
  formatarValorInput(salarioInput);
});

salvarBackup.addEventListener("click", () => {
  const backup = gerarBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "minhas-contas-backup.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

restaurarBackup.addEventListener("click", () => {
  backupInput.click();
});

backupInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const dados = JSON.parse(reader.result);
      const ok = aplicarBackup(dados);
      if (ok) {
        renderizarCategorias();
        renderizar();
        mostrarToast("Backup restaurado com sucesso.");
        return;
      }
    } catch (error) {
      // ignore
    }
    mostrarToast("Nao foi possivel restaurar o backup.");
  };
  reader.readAsText(file);
  backupInput.value = "";
});

criarMeses();
renderizarCategorias();
renderizar();
aplicarTema(carregarTema());
