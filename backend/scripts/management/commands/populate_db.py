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
        # Eventos
        # =========================
        eventos_data = [
            # Tecnologia
            (
                "Tech Summit Brasil 2026",
                "O maior encontro de tecnologia do país, reunindo profissionais e entusiastas para três dias de palestras, workshops e networking.",
                "Centro de Convenções Anhembi, São Paulo",
            ),
            (
                "Workshop Fullstack React + Django",
                "Construa uma aplicação completa do zero usando React no frontend e Django REST Framework no backend.",
                "Hub de Inovação, Sala 305, Belo Horizonte",
            ),
            (
                "Imersão em Inteligência Artificial",
                "Três dias intensivos explorando machine learning, deep learning e IA generativa com casos práticos do mercado.",
                "Auditório Principal da UNICAMP, Campinas",
            ),
            (
                "Hackathon Open Source",
                "48 horas de desenvolvimento colaborativo em projetos open source. Premiação para as melhores contribuições.",
                "Google for Startups, São Paulo",
            ),
            (
                "DevOps na Prática",
                "Workshop hands-on sobre CI/CD, containers, Kubernetes e observabilidade em ambientes de produção.",
                "Sala de Treinamento TechCorp, Curitiba",
            ),
            (
                "Conferência Python Brasil",
                "Edição anual da maior conferência de Python da América Latina com trilhas para iniciantes e avançados.",
                "Centro de Eventos da PUC, Porto Alegre",
            ),
            (
                "Meetup de Cibersegurança",
                "Encontro mensal para discutir vulnerabilidades recentes, melhores práticas de segurança e CTF ao vivo.",
                "Espaço de Coworking WeWork, Rio de Janeiro",
            ),
            (
                "Cloud Computing Summit",
                "Arquiteturas serverless, multi-cloud e estratégias de migração com cases de grandes empresas brasileiras.",
                "Hotel Intercontinental, São Paulo",
            ),
            (
                "Mobile Dev Conference",
                "Flutter, React Native e desenvolvimento nativo: tendências e melhores práticas para apps modernos.",
                "Teatro Municipal, Florianópolis",
            ),
            (
                "Data Engineering Week",
                "Pipelines de dados, data lakes, streaming e governança de dados em escala empresarial.",
                "Centro de Convenções Ulysses Guimarães, Brasília",
            ),
            (
                "Frontend Masters Live",
                "CSS moderno, performance web, acessibilidade e as últimas novidades do ecossistema JavaScript.",
                "Sala 201, FIAP, São Paulo",
            ),
            (
                "API Design Workshop",
                "REST, GraphQL e gRPC: quando usar cada um, design patterns e versionamento de APIs.",
                "Hub de Tecnologia, Recife",
            ),
            # Saúde
            (
                "Semana da Saúde Integral",
                "Programação completa sobre bem-estar físico e mental com profissionais renomados.",
                "Parque Municipal, Belo Horizonte",
            ),
            (
                "Congresso de Nutrição Esportiva",
                "Estratégias nutricionais para atletas e praticantes de atividade física de todos os níveis.",
                "Centro de Convenções, Salvador",
            ),
            (
                "Workshop de Mindfulness",
                "Técnicas práticas de meditação e atenção plena para redução de estresse no ambiente de trabalho.",
                "Espaço Zen, Vila Madalena, São Paulo",
            ),
            (
                "Simpósio de Saúde Mental no Trabalho",
                "Burnout, ansiedade e depressão: prevenção e manejo no contexto corporativo.",
                "Auditório da FMUSP, São Paulo",
            ),
            (
                "Jornada de Fisioterapia Desportiva",
                "Prevenção de lesões, reabilitação e performance esportiva com abordagens baseadas em evidência.",
                "Ginásio Poliesportivo, Curitiba",
            ),
            (
                "Conferência de Enfermagem",
                "Inovações tecnológicas na enfermagem e o papel do enfermeiro na saúde digital.",
                "Centro de Eventos, Goiânia",
            ),
            # Negócios
            (
                "Startup Weekend Belo Horizonte",
                "54 horas para transformar uma ideia em um negócio viável. Mentoria, pitch e validação.",
                "SEED-MG, Belo Horizonte",
            ),
            (
                "Finanças para Desenvolvedores",
                "Educação financeira, investimentos e planejamento de carreira para profissionais de tecnologia.",
                "Sala 101, B3 Educação, São Paulo",
            ),
            (
                "Marketing Digital Summit",
                "SEO, tráfego pago, growth hacking e estratégias de conteúdo que funcionam em 2026.",
                "Hotel Copacabana Palace, Rio de Janeiro",
            ),
            (
                "Liderança e Gestão Ágil",
                "Frameworks ágeis aplicados à gestão de pessoas e times de alta performance.",
                "Espaço de Eventos InovaBH, Belo Horizonte",
            ),
            (
                "Empreendedorismo Social",
                "Como criar negócios de impacto que geram valor social e financeiro.",
                "Instituto Ayrton Senna, São Paulo",
            ),
            (
                "Workshop de Vendas Consultivas",
                "Técnicas de vendas B2B, qualificação de leads e construção de relacionamentos comerciais.",
                "Sala de Treinamento, Porto Alegre",
            ),
            # Educação
            (
                "Congresso Nacional de Educação",
                "Políticas públicas, metodologias inovadoras e o futuro da educação brasileira.",
                "Centro de Convenções, Brasília",
            ),
            (
                "EAD em Foco",
                "Plataformas, engajamento e avaliação: desafios e soluções para o ensino a distância.",
                "Auditório da USP, São Paulo",
            ),
            (
                "Educação STEAM na Prática",
                "Integrando ciência, tecnologia, engenharia, artes e matemática no ensino fundamental.",
                "Escola Parque, Rio de Janeiro",
            ),
            (
                "Inclusão Digital na Educação",
                "Tecnologias assistivas e estratégias para tornar a educação digital acessível a todos.",
                "Centro Cultural, Recife",
            ),
            # Ciências
            (
                "Semana Acadêmica de Física",
                "Palestras sobre astrofísica, mecânica quântica e as fronteiras da física contemporânea.",
                "Instituto de Física da UFRJ, Rio de Janeiro",
            ),
            (
                "Simpósio de Biotecnologia",
                "Avanços em engenharia genética, bioinformática e aplicações industriais da biotecnologia.",
                "Centro de Biociências da UFPE, Recife",
            ),
            (
                "Encontro de Matemática Aplicada",
                "Modelagem matemática, otimização e aplicações em inteligência artificial e finanças.",
                "IMPA, Rio de Janeiro",
            ),
            # Artes e Cultura
            (
                "Festival de Cinema Independente",
                "Exibição e debate de curtas e longas-metragens de cineastas independentes brasileiros.",
                "Cine Arte UFF, Niterói",
            ),
            (
                "Workshop de Produção Musical",
                "Do beat ao master: produção musical completa usando ferramentas profissionais e acessíveis.",
                "Studio 47, São Paulo",
            ),
            (
                "Feira Literária do Centro-Oeste",
                "Lançamentos, mesas redondas com autores e oficinas de escrita criativa.",
                "Centro Cultural Oscar Niemeyer, Goiânia",
            ),
            (
                "Mostra de Artes Visuais Contemporâneas",
                "Exposição e palestras sobre arte digital, instalações interativas e arte urbana.",
                "MAM, São Paulo",
            ),
        ]

        sub_por_categoria = {}
        for sub in subcategorias:
            sub_por_categoria.setdefault(sub.category.name, []).append(sub)

        # Mapeia cada evento para a categoria mais adequada
        categoria_evento = {
            0: "Tecnologia",
            1: "Tecnologia",
            2: "Tecnologia",
            3: "Tecnologia",
            4: "Tecnologia",
            5: "Tecnologia",
            6: "Tecnologia",
            7: "Tecnologia",
            8: "Tecnologia",
            9: "Tecnologia",
            10: "Tecnologia",
            11: "Tecnologia",
            12: "Saúde",
            13: "Saúde",
            14: "Saúde",
            15: "Saúde",
            16: "Saúde",
            17: "Saúde",
            18: "Negócios",
            19: "Negócios",
            20: "Negócios",
            21: "Negócios",
            22: "Negócios",
            23: "Negócios",
            24: "Educação",
            25: "Educação",
            26: "Educação",
            27: "Educação",
            28: "Ciências",
            29: "Ciências",
            30: "Ciências",
            31: "Artes e Cultura",
            32: "Artes e Cultura",
            33: "Artes e Cultura",
            34: "Artes e Cultura",
        }

        eventos = []
        statuses = ["APPROVED"] * 7 + ["PENDING"] * 2 + ["REJECTED"]

        for i, (titulo, descricao, local) in enumerate(eventos_data):
            cat_name = categoria_evento[i]
            cat = categorias[cat_name]
            sub = random.choice(sub_por_categoria[cat_name])

            evento = Event.objects.create(
                title=titulo,
                description=descricao,
                location=local,
                event_date=timezone.now()
                + timezone.timedelta(days=random.randint(3, 90)),
                capacity=random.randint(30, 500),
                status=random.choice(statuses),
                organizer=random.choice(organizadores),
                category=cat,
                subcategory=sub,
            )
            eventos.append(evento)

        self.stdout.write(f"  {len(eventos)} eventos")

        # =========================
        # Inscrições
        # =========================
        eventos_aprovados = [e for e in eventos if e.status == "APPROVED"]
        registros = []
        pares_existentes = set()

        for user in participantes:
            qtd = random.randint(1, 6)
            eventos_usuario = random.sample(
                eventos_aprovados, k=min(qtd, len(eventos_aprovados))
            )

            for evento in eventos_usuario:
                par = (user.pk, evento.pk)
                if par in pares_existentes:
                    continue
                pares_existentes.add(par)

                registros.append(
                    Registration(
                        user=user,
                        event=evento,
                        check_in=random.random() < 0.3,
                    )
                )

        Registration.objects.bulk_create(registros)

        self.stdout.write(f"  {len(registros)} inscrições")
        self.stdout.write(self.style.SUCCESS("Banco populado com sucesso!"))
