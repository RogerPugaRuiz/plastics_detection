from django.shortcuts import render, redirect
from django.http import HttpResponse
from map_viewer.models import Document

# Create your views here.

def index(request):
    datos_mapa = {}
    datos_heatmap = {}
    return render(request, 'map.html')

def map(request):
    datos_mapa = {}
    datos_heatmap = {}
    return render(request, 'map.html',{
        'datos_mapa': datos_mapa,
        'datos_heatmap': datos_heatmap,
    })

def import_document(request):
    if (request.method == "POST"):
        # Obtener el archivo subido desde el formulario
        archivo = request.FILES['document']
        
        # Crear un nuevo objeto Document y guardarlo en la base de datos
        nuevo_documento = Document(file=archivo, title=archivo.name)
        nuevo_documento.save()
        
        # Redirigir al usuario a otra página, por ejemplo la lista de documentos importados
        return redirect('listar_documentos')
    return render(request, 'map_viewer.html')


def list_documents(request):
    documentos = Document.objects.all()
    return render(request, 'list_documents.html', {'documentos': documentos})