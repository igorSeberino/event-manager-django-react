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

        # =========================
        # Categorias
        # =========================
        tech = Category.objects.create(name="Tecnologia")
        health = Category.objects.create(name="Saúde")
        business = Category.objects.create(name="Negócios")

        sub_ia = SubCategory.objects.create(
            name="Inteligência Artificial", category=tech
        )
        sub_web = SubCategory.objects.create(name="Desenvolvimento Web", category=tech)
        sub_data = SubCategory.objects.create(name="Data Science", category=tech)

        sub_nutricao = SubCategory.objects.create(name="Nutrição", category=health)
        sub_mental = SubCategory.objects.create(name="Saúde Mental", category=health)

        sub_marketing = SubCategory.objects.create(name="Marketing", category=business)
        sub_financas = SubCategory.objects.create(name="Finanças", category=business)

        subcategorias = [
            sub_ia,
            sub_web,
            sub_data,
            sub_nutricao,
            sub_mental,
            sub_marketing,
            sub_financas,
        ]

        # =========================
        # Usuários
        # =========================
        senha = make_password(self.strong_password())

        admin = User.objects.create(
            name="Administrador do Sistema",
            email="admin@eventmanager.com",
            password=senha,
            role="ADMIN",
        )

        organizadores = [
            User.objects.create(
                name="Carlos Tech",
                email="carlos.tech@eventos.com",
                password=senha,
                role="ORGANIZER",
            ),
            User.objects.create(
                name="Fernanda Business",
                email="fernanda.business@eventos.com",
                password=senha,
                role="ORGANIZER",
            ),
        ]

        participantes = [
            User.objects.create(
                name="Lucas Almeida",
                email="lucas.almeida@email.com",
                password=senha,
                role="USER",
            ),
            User.objects.create(
                name="Juliana Rocha",
                email="juliana.rocha@email.com",
                password=senha,
                role="USER",
            ),
            User.objects.create(
                name="Rafael Costa",
                email="rafael.costa@email.com",
                password=senha,
                role="USER",
            ),
            User.objects.create(
                name="Ana Beatriz",
                email="ana.beatriz@email.com",
                password=senha,
                role="USER",
            ),
        ]

        # =========================
        # Eventos
        # =========================
        eventos_info = [
            (
                "Tech Summit Brasil 2026",
                "Maior evento de tecnologia do país.",
                "Centro de Convenções",
            ),
            (
                "Workshop Fullstack React + Django",
                "Aplicações modernas na prática.",
                "Sala 305",
            ),
            (
                "Imersão em Inteligência Artificial",
                "IA aplicada ao mercado.",
                "Auditório Principal",
            ),
            (
                "Semana da Saúde Integral",
                "Bem-estar físico e mental.",
                "Parque Municipal",
            ),
            (
                "Finanças para Desenvolvedores",
                "Educação financeira na carreira tech.",
                "Sala 101",
            ),
        ]

        eventos = []

        for titulo, descricao, local in eventos_info:
            sub = random.choice(subcategorias)

            evento = Event.objects.create(
                title=titulo,
                description=descricao,
                location=local,
                event_date=timezone.now()
                + timezone.timedelta(days=random.randint(7, 45)),
                capacity=random.randint(50, 200),
                status=random.choice(["APPROVED", "PENDING"]),
                organizer=random.choice(organizadores),
                category=sub.category,
                subcategory=sub,
            )

            eventos.append(evento)

        # =========================
        # Inscrições
        # =========================
        registros = []

        for user in participantes:
            eventos_usuario = random.sample(eventos, k=random.randint(1, 3))

            for evento in eventos_usuario:
                registros.append(
                    Registration(
                        user=user,
                        event=evento,
                        check_in=random.choice([True, False]),
                    )
                )

        Registration.objects.bulk_create(registros)

        self.stdout.write(
            self.style.SUCCESS("Banco populado com dados válidos e realistas 🚀")
        )
