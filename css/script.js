
const menuButton = document.getElementById("menuButton");
const nav = document.querySelector(".nav");

if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
        nav.classList.toggle("mobile-open");
    });
}

// Animações dos elementos
const elements = document.querySelectorAll(
    ".stat-box, .scorer-row, .sponsor-card, .match-card"
);

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(element => {
        element.classList.add("hidden");
        observer.observe(element);
    });
}

// Carregar jogos do Supabase
async function carregarJogos() {
    const container = document.getElementById("gamesContainer");
    if (!container) return;

    if (!window.supabase || typeof supabaseClient === "undefined") {
        container.textContent = "Não foi possível iniciar a conexão com o banco de dados.";
        return;
    }

    container.textContent = "Carregando jogos do Jariva...";

    const { data, error } = await supabaseClient
    .from("partidas")
    .select(`
        *,
        adversario:times!partidas_adversario_id_fkey (
            nome,
            escudo_url
        )
    `)
    .order("data_partida", { ascending: false });

    if (error) {
        console.error("Erro ao buscar partidas:", error);
        container.textContent = "Não foi possível carregar os jogos.";
        return;
    }

    if (!data || data.length === 0) {
        container.textContent = "Nenhum jogo cadastrado ainda.";
        return;
    }

    container.replaceChildren();

    data.forEach(jogo => {
        const jariva = Number(jogo.gols_jariva);
        const adversario = Number(jogo.gols_adversario);
        const venceu = jariva > adversario;
        const perdeu = jariva < adversario;
        const resultado = venceu ? "VITÓRIA" : perdeu ? "DERROTA" : "EMPATE";
        const saldo = jariva - adversario;

        const card = document.createElement("article");
        card.className = `game-card ${venceu ? "win" : perdeu ? "loss" : "draw"}`;

        const topo = document.createElement("div");
        topo.className = "game-card-top";

        const info = document.createElement("div");
        info.className = "game-info";

        const dataPartida = document.createElement("span");
        dataPartida.textContent = jogo.data_partida
            ? new Date(`${jogo.data_partida}T12:00:00`).toLocaleDateString("pt-BR", {
                day: "2-digit", month: "short", year: "numeric"
            }).toUpperCase()
            : "DATA NÃO INFORMADA";

        const detalhes = document.createElement("strong");
        detalhes.textContent = `${jogo.competicao || "AMISTOSO"}${jogo.local_partida ? " · " + jogo.local_partida : ""}`;

        info.append(dataPartida, detalhes);

        const status = document.createElement("span");
        status.className = `game-status ${venceu ? "win-status" : perdeu ? "loss-status" : ""}`;
        status.textContent = resultado;

        topo.append(info, status);

        const principal = document.createElement("div");
        principal.className = "game-main";

        const timeJariva = document.createElement("div");
        timeJariva.className = "team";

        const escudoJariva = document.createElement("img");
        escudoJariva.src = "img/escudo.png";
        escudoJariva.alt = "Jariva FC";

        const nomeJariva = document.createElement("strong");
        nomeJariva.textContent = "JARIVA FC";
        timeJariva.append(escudoJariva, nomeJariva);

        const placar = document.createElement("div");
        placar.className = "score";

        const golsJariva = document.createElement("strong");
        golsJariva.textContent = jariva;

        const separador = document.createElement("span");
        separador.textContent = "×";

        const golsAdversario = document.createElement("strong");
        golsAdversario.textContent = adversario;
        placar.append(golsJariva, separador, golsAdversario);

        const timeAdversario = document.createElement("div");
        timeAdversario.className = "team opponent";

        const escudoAdversario = document.createElement("img");
escudoAdversario.src = jogo.adversario?.escudo_url || "";
escudoAdversario.alt = jogo.adversario?.nome || "Escudo do adversário";

const nomeAdversario = document.createElement("strong");
nomeAdversario.textContent =
    (jogo.adversario?.nome || "ADVERSÁRIO").toUpperCase();
        
        timeAdversario.append(escudoAdversario, nomeAdversario);
        principal.append(timeJariva, placar, timeAdversario);

        const rodape = document.createElement("div");
        rodape.className = "game-footer";

        const local = document.createElement("span");
        local.textContent = jogo.local_partida ? `📍 ${jogo.local_partida}` : "📍 Local não informado";

        const diferenca = document.createElement("span");
        diferenca.textContent = `${saldo > 0 ? "+" : ""}${saldo} ${Math.abs(saldo) === 1 ? "GOL" : "GOLS"}`;

        rodape.append(local, diferenca);
        card.append(topo, principal, rodape);
        container.append(card);
    });
}


async function carregarArtilharia() {
    const container = document.getElementById("scorersContainer");
    if (!container) return;

    container.textContent = "Carregando artilharia...";

    try {
        // Buscar todos os jogadores cadastrados
        const { data: jogadores, error: erroJogadores } =
            await supabaseClient
                .from("jogadores")
                .select("id, nome");

        if (erroJogadores) throw erroJogadores;

        // Buscar os registros de gols
        const { data: gols, error: erroGols } =
            await supabaseClient
                .from("gols")
                .select("jogador_id");

        if (erroGols) throw erroGols;

        // Contar os gols de cada jogador
        const contagem = {};

        (gols || []).forEach(gol => {
            if (gol.jogador_id == null) return;

            const id = String(gol.jogador_id);
            contagem[id] = (contagem[id] || 0) + 1;
        });

        // Ordenar do maior número de gols para o menor
        const ranking = (jogadores || [])
            .map(jogador => ({
                ...jogador,
                totalGols: contagem[String(jogador.id)] || 0
            }))
            .sort((a, b) =>
                b.totalGols - a.totalGols ||
                a.nome.localeCompare(b.nome, "pt-BR")
            );

        container.replaceChildren();

        // Cabeçalho
        const cabecalho = document.createElement("div");
        cabecalho.className = "scorer-row header-row";

        ["#", "JOGADOR", "JOGOS", "GOLS"].forEach(texto => {
            const coluna = document.createElement("span");
            coluna.textContent = texto;
            cabecalho.appendChild(coluna);
        });

        container.appendChild(cabecalho);

        // Jogadores
        ranking.forEach((jogador, indice) => {
            const linha = document.createElement("div");
            linha.className = "scorer-row";

            const posicao = document.createElement("span");
            posicao.textContent = indice + 1;

            const nomeArea = document.createElement("div");
            nomeArea.className = "player-mini";

            const avatar = document.createElement("span");
            avatar.className = "player-avatar";
            avatar.textContent = jogador.nome
                .trim()
                .charAt(0)
                .toUpperCase();

            const nome = document.createElement("span");
            nome.textContent = jogador.nome;

            nomeArea.append(avatar, nome);

            const jogos = document.createElement("span");
            jogos.textContent = "2";

            const total = document.createElement("strong");
            total.textContent = jogador.totalGols;

            linha.append(posicao, nomeArea, jogos, total);
            container.appendChild(linha);
        });

    } catch (erro) {
        console.error("Erro ao carregar artilharia:", erro);
        container.textContent =
            "Não foi possível carregar a artilharia.";
    }
}


carregarJogos();
carregarArtilharia();
