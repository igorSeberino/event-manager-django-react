from django.core.management.base import BaseCommand
from events.models import Event, Category, SubCategory
from accounts.models import User
from registrations.models import Registration
from django.utils import timezone
from django.db import transaction
from django.contrib.auth.hashers import make_password
import random


class Command(BaseCommand):
    help = "Popula o banco com dados realistas e válidos para o sistema."

    def strong_password(self):
        return "Admin@123"

    @transaction.atomic
    def handle(self, *args, **options):
        Registration.objects.all().delete()
        Event.objects.all().delete()
        SubCategory.objects.all().delete()
        Category.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()

        senha = make_password(self.strong_password())

        # =========================
        # Categorias e Subcategorias
        # =========================
        categorias_data = {
            "Tecnologia": [
                "Inteligência Artificial",
                "Desenvolvimento Web",
                "Data Science",
                "Cibersegurança",
                "Cloud Computing",
                "DevOps",
                "Mobile",
            ],
            "Saúde": [
                "Nutrição",
                "Saúde Mental",
                "Medicina Esportiva",
                "Fisioterapia",
                "Enfermagem",
            ],
            "Negócios": [
                "Marketing",
                "Finanças",
                "Empreendedorismo",
                "Gestão de Pessoas",
                "Vendas",
            ],
            "Educação": [
                "Pedagogia",
                "Educação a Distância",
                "Metodologias Ativas",
                "Educação Inclusiva",
            ],
            "Ciências": [
                "Física",
                "Biologia",
                "Química",
                "Matemática",
            ],
            "Artes e Cultura": [
                "Música",
                "Cinema",
                "Artes Visuais",
                "Literatura",
            ],
        }

        categorias = {}
        subcategorias = []

        for cat_name, subs in categorias_data.items():
            cat = Category.objects.create(name=cat_name)
            categorias[cat_name] = cat
            for sub_name in subs:
                sub = SubCategory.objects.create(name=sub_name, category=cat)
                subcategorias.append(sub)

        self.stdout.write(
            f"  {len(categorias)} categorias, {len(subcategorias)} subcategorias"
        )

        # =========================
        # Usuários (volume)
        # =========================
        nomes = [
            "Lucas",
            "Juliana",
            "Rafael",
            "Ana",
            "Pedro",
            "Mariana",
            "Gabriel",
            "Camila",
            "Matheus",
            "Larissa",
            "Bruno",
            "Fernanda",
            "Gustavo",
            "Isabela",
            "Thiago",
            "Letícia",
            "Diego",
            "Natália",
            "Vinícius",
            "Carolina",
            "Felipe",
            "Beatriz",
            "André",
            "Priscila",
            "Rodrigo",
            "Patrícia",
            "Leonardo",
            "Amanda",
            "Marcelo",
            "Daniela",
            "Eduardo",
            "Renata",
            "Henrique",
            "Vanessa",
            "Ricardo",
            "Tatiana",
            "Caio",
            "Aline",
            "Fábio",
            "Jéssica",
            "João",
            "Débora",
            "Paulo",
            "Raquel",
            "Sérgio",
            "Cláudia",
            "Leandro",
            "Elaine",
            "Rogério",
            "Simone",
        ]
        sobrenomes = [
            "Silva",
            "Santos",
            "Oliveira",
            "Souza",
            "Pereira",
            "Costa",
            "Rodrigues",
            "Almeida",
            "Nascimento",
            "Lima",
            "Araújo",
            "Fernandes",
            "Carvalho",
            "Gomes",
            "Martins",
            "Rocha",
            "Ribeiro",
            "Barros",
            "Freitas",
            "Moreira",
            "Dias",
            "Monteiro",
            "Cardoso",
            "Batista",
            "Campos",
            "Correia",
            "Teixeira",
            "Vieira",
            "Nunes",
            "Mendes",
        ]

        admin = User.objects.create(
            name="Administrador do Sistema",
            email="admin@eventmanager.com",
            password=senha,
            role="ADMIN",
        )

        organizadores = []
        for i in range(10):
            nome = f"{nomes[i]} {sobrenomes[i]}"
            org = User.objects.create(
                name=nome,
                email=f"organizador{i + 1}@eventos.com",
                password=senha,
                role="ORGANIZER",
            )
            organizadores.append(org)

        participantes = []
        for i in range(100):
            nome = f"{nomes[i % len(nomes)]} {sobrenomes[i % len(sobrenomes)]}"
            if i >= len(nomes):
                nome += f" {i}"
            user = User.objects.create(
                name=nome,
                email=f"usuario{i + 1}@email.com",
                password=senha,
                role="USER",
            )
            participantes.append(user)

        self.stdout.write(
            f"  1 admin, {len(organizadores)} organizadores, {len(participantes)} participantes"
        )

        # =========================
        # Eventos (acadêmicos, na Católica de Santa Catarina)
        # =========================
        # (título, descrição) — todos ocorrem em salas da instituição.
        eventos_data = [
            # Tecnologia
            (
                "Minicurso de Python para Iniciantes",
                "Introdução à lógica de programação e à linguagem Python, com exercícios práticos no laboratório.",
            ),
            (
                "Workshop de Desenvolvimento Web com React",
                "Construa uma interface moderna do zero usando React, componentes e consumo de APIs.",
            ),
            (
                "Palestra: Inteligência Artificial no Dia a Dia",
                "Como os modelos de IA já fazem parte da rotina e o que esperar dos próximos anos.",
            ),
            (
                "Semana Acadêmica de Engenharia de Software",
                "Palestras e oficinas sobre boas práticas, testes e arquitetura de sistemas.",
            ),
            (
                "Oficina de Git e GitHub",
                "Versionamento de código, fluxo de trabalho em equipe e contribuição em projetos.",
            ),
            (
                "Introdução à Ciência de Dados",
                "Coleta, limpeza e visualização de dados utilizando ferramentas open source.",
            ),
            (
                "Palestra de Cibersegurança e Boas Práticas",
                "Senhas, phishing e proteção de dados pessoais no ambiente acadêmico e profissional.",
            ),
            (
                "Workshop de Banco de Dados e SQL",
                "Modelagem relacional e consultas práticas sobre um banco de dados real.",
            ),
            (
                "Bate-papo sobre Carreira em TI",
                "Mercado de trabalho, estágios e primeiros passos na área de tecnologia.",
            ),
            (
                "Minicurso de Desenvolvimento Mobile",
                "Primeiros passos no desenvolvimento de aplicativos para dispositivos móveis.",
            ),
            (
                "Oficina de Cloud Computing",
                "Conceitos de nuvem, contêineres e implantação de aplicações.",
            ),
            (
                "Hackathon Acadêmico Católica SC",
                "Maratona de programação de um dia para resolver desafios reais propostos por empresas parceiras.",
            ),
            # Saúde
            (
                "Semana da Saúde Integral",
                "Programação sobre bem-estar físico e mental para a comunidade acadêmica.",
            ),
            (
                "Palestra de Nutrição e Rotina Estudantil",
                "Alimentação equilibrada e energia para a maratona de estudos e provas.",
            ),
            (
                "Oficina de Mindfulness e Controle da Ansiedade",
                "Técnicas de respiração e atenção plena para reduzir o estresse acadêmico.",
            ),
            (
                "Roda de Conversa sobre Saúde Mental",
                "Espaço de acolhimento sobre ansiedade, burnout e equilíbrio emocional.",
            ),
            (
                "Jornada de Fisioterapia e Ergonomia",
                "Prevenção de lesões e postura correta no estudo e no trabalho.",
            ),
            (
                "Palestra de Primeiros Socorros",
                "Noções básicas de primeiros socorros para situações do cotidiano.",
            ),
            # Negócios
            (
                "Workshop de Empreendedorismo Universitário",
                "Da ideia ao primeiro cliente: validação de negócios para estudantes.",
            ),
            (
                "Palestra de Educação Financeira",
                "Organização do orçamento, investimentos iniciais e planejamento de carreira.",
            ),
            (
                "Oficina de Marketing Digital",
                "Conteúdo, redes sociais e divulgação para projetos e pequenos negócios.",
            ),
            (
                "Minicurso de Gestão de Projetos",
                "Métodos ágeis aplicados a projetos acadêmicos e profissionais.",
            ),
            (
                "Bate-papo com Egressos Empreendedores",
                "Histórias de ex-alunos que abriram o próprio negócio.",
            ),
            (
                "Palestra de Liderança e Trabalho em Equipe",
                "Habilidades de comunicação e liderança para times de alta performance.",
            ),
            # Educação
            (
                "Seminário de Metodologias Ativas de Ensino",
                "Estratégias que colocam o estudante no centro do aprendizado.",
            ),
            (
                "Oficina de Produção de Trabalhos Acadêmicos",
                "Normas, pesquisa e escrita científica para TCC e artigos.",
            ),
            (
                "Palestra de Educação Inclusiva",
                "Acessibilidade e práticas pedagógicas para uma educação para todos.",
            ),
            (
                "Minicurso de Oratória e Apresentações",
                "Técnicas para falar em público e apresentar trabalhos com segurança.",
            ),
            # Ciências
            (
                "Semana Acadêmica de Ciências Exatas",
                "Palestras sobre física, matemática aplicada e suas conexões com a tecnologia.",
            ),
            (
                "Oficina de Matemática Aplicada",
                "Modelagem e resolução de problemas reais com ferramentas matemáticas.",
            ),
            (
                "Palestra de Biotecnologia e Inovação",
                "Avanços recentes em biotecnologia e suas aplicações no mercado.",
            ),
            # Artes e Cultura
            (
                "Mostra de Cinema Universitário",
                "Exibição e debate de curtas-metragens produzidos por estudantes.",
            ),
            (
                "Oficina de Produção Musical",
                "Noções de gravação, edição e produção musical com ferramentas acessíveis.",
            ),
            (
                "Sarau Literário Católica SC",
                "Noite de leitura, poesia e música aberta à comunidade acadêmica.",
            ),
            (
                "Exposição de Artes Visuais",
                "Mostra de trabalhos de arte digital e ilustração dos estudantes.",
            ),
        ]

        sub_por_categoria = {}
        for sub in subcategorias:
            sub_por_categoria.setdefault(sub.category.name, []).append(sub)

        # Cada evento mapeado para a categoria mais adequada
        categoria_evento = {
            **{i: "Tecnologia" for i in range(0, 12)},
            **{i: "Saúde" for i in range(12, 18)},
            **{i: "Negócios" for i in range(18, 24)},
            **{i: "Educação" for i in range(24, 28)},
            **{i: "Ciências" for i in range(28, 31)},
            **{i: "Artes e Cultura" for i in range(31, 35)},
        }

        # Salas da Católica SC: blocos A–I, com quantidades diferentes de salas.
        salas_por_bloco = {
            "A": 8,
            "B": 6,
            "C": 4,
            "D": 10,
            "E": 5,
            "F": 3,
            "G": 6,
            "H": 14,
            "I": 2,
        }
        salas_ocupadas = set()

        def gerar_sala(dia):
            # Evita duas reservas da mesma sala no mesmo dia.
            for _ in range(200):
                bloco = random.choice(list(salas_por_bloco.keys()))
                numero = random.randint(1, salas_por_bloco[bloco])
                sala = f"{bloco}{numero:02d}"
                if (sala, dia) not in salas_ocupadas:
                    salas_ocupadas.add((sala, dia))
                    return sala
            return sala

        motivos_rejeicao = [
            "Descrição insuficiente. Detalhe melhor os objetivos e a programação do evento.",
            "A capacidade informada excede a lotação da sala solicitada.",
            "Conflito de horário com outro evento já aprovado para a mesma sala.",
            "Data muito próxima. Reenvie com pelo menos duas semanas de antecedência.",
            "Faltam informações sobre o responsável e os materiais necessários.",
            "O tema precisa de melhor alinhamento com as áreas acadêmicas da instituição.",
        ]

        # Define de forma controlada quais eventos já ocorreram (~40%).
        indices = list(range(len(eventos_data)))
        random.shuffle(indices)
        passados = set(indices[: int(len(eventos_data) * 0.4)])

        agora = timezone.now()
        horarios = [8, 10, 13, 14, 16, 19]

        eventos_meta = []  # (evento, is_past)

        for i, (titulo, descricao) in enumerate(eventos_data):
            cat = categorias[categoria_evento[i]]
            sub = random.choice(sub_por_categoria[categoria_evento[i]])
            is_past = i in passados

            # Coerência temporal x status:
            # - eventos passados já aconteceram, portanto estão aprovados;
            # - eventos futuros podem estar aprovados, pendentes ou rejeitados.
            if is_past:
                status = Event.Status.APPROVED
                base = agora - timezone.timedelta(days=random.randint(5, 150))
            else:
                status = random.choices(
                    [
                        Event.Status.APPROVED,
                        Event.Status.PENDING,
                        Event.Status.REJECTED,
                    ],
                    weights=[6, 3, 2],
                )[0]
                base = agora + timezone.timedelta(days=random.randint(3, 120))

            event_date = base.replace(
                hour=random.choice(horarios),
                minute=random.choice([0, 30]),
                second=0,
                microsecond=0,
            )

            evento = Event.objects.create(
                title=titulo,
                description=descricao,
                location=f"Sala {gerar_sala(event_date.date())} - Católica SC",
                event_date=event_date,
                capacity=random.randint(20, 60),
                status=status,
                organizer=random.choice(organizadores),
                category=cat,
                subcategory=sub,
                rejection_reason=(
                    random.choice(motivos_rejeicao)
                    if status == Event.Status.REJECTED
                    else ""
                ),
                # Eventos passados já foram encerrados pelo organizador.
                closed_at=(
                    event_date + timezone.timedelta(hours=2) if is_past else None
                ),
            )
            eventos_meta.append((evento, is_past))

        aprovados = sum(1 for e, _ in eventos_meta if e.status == Event.Status.APPROVED)
        pendentes = sum(1 for e, _ in eventos_meta if e.status == Event.Status.PENDING)
        rejeitados = sum(
            1 for e, _ in eventos_meta if e.status == Event.Status.REJECTED
        )
        self.stdout.write(
            f"  {len(eventos_meta)} eventos "
            f"({aprovados} aprovados, {pendentes} pendentes, {rejeitados} rejeitados; "
            f"{len(passados)} já realizados)"
        )

        # =========================
        # Inscrições (somente em eventos aprovados)
        # =========================
        registros = []
        for evento, is_past in eventos_meta:
            if evento.status != Event.Status.APPROVED:
                continue

            # Eventos já realizados costumam estar mais cheios; os futuros variam mais.
            if is_past:
                minimo = max(1, int(evento.capacity * 0.5))
            else:
                minimo = max(1, int(evento.capacity * 0.15))
            qtd = min(random.randint(minimo, evento.capacity), len(participantes))

            for user in random.sample(participantes, qtd):
                # Check-in só existe para eventos que já aconteceram.
                check_in = is_past and random.random() < 0.75
                registros.append(
                    Registration(user=user, event=evento, check_in=check_in)
                )

        Registration.objects.bulk_create(registros)

        checkins = sum(1 for r in registros if r.check_in)
        self.stdout.write(f"  {len(registros)} inscrições ({checkins} check-ins)")
        self.stdout.write(self.style.SUCCESS("Banco populado com sucesso!"))
