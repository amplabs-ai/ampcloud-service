from app.response import Response


def client_exception(error):
    return Response(error.code, error.description).to_dict(), error.code

def problem_exception(error):
    return Response(error.status, error.detail).to_dict(), error.status