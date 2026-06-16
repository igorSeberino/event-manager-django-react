from django.conf import settings


def auth_cookie_kwargs():
    """Flags de cookie de autenticação dirigidas pelo ambiente.

    Em desenvolvimento (DEBUG=True) os cookies não podem ser `Secure`, pois o
    navegador não os envia sobre HTTP. Em produção (DEBUG=False) usamos
    `Secure` + `SameSite=None` para suportar cenários cross-site sobre HTTPS.
    """
    secure = not settings.DEBUG
    return {
        "httponly": True,
        "secure": secure,
        "samesite": "None" if secure else "Lax",
    }
