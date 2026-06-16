from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """Paginação padrão do projeto.

    Mantém PAGE_SIZE=9 por padrão, mas permite que o cliente solicite mais
    itens por página via `?page_size=N` (até `max_page_size`). Isso atende
    telas de gerenciamento que precisam da lista completa sem quebrar as
    telas que já paginam corretamente.
    """

    page_size = 9
    page_size_query_param = "page_size"
    max_page_size = 1000
