from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from map_viewer.models import Document, Coordinate, Navigator, Element, create_navigator
from django.urls import reverse

import csv
import json
# Create your views here.


def index(request):
    navigator = create_navigator()
    
    if request.method == 'POST':
        return render(request, 'map.html')

    if request.method == "GET":
        return render(request, 'map.html', {'nav':navigator.at_list()})

def import_document(request):
    if request.method == 'POST':
        navigator = create_navigator()
        doc = request.FILES['document']
        title = doc.name

        nuevo_documento = Document(title=title, file=doc)
        nuevo_documento.save_with_coordinates()

        return redirect('listar_documentos')

    return render(request, 'map.html', {'nav':navigator.at_list()})


def find_document_ajax(request):
    busqueda = request.GET.get('q', '')
    documents = Document.objects.filter_by_title(busqueda)
    results = []
    for document in documents:
        results.append({
            'id': document.id,
            'title': document.title,
            'date_time': document.date_time.strftime('%Y-%m-%d %H:%M:%S')
        })
    return JsonResponse({'resultados': results})


def list_documents(request):
    documents = Document.objects.all()
    navigator = create_navigator()
    # coordinates = Coordenate.objects.all()
    return render(request, 'list_documents.html', {'documents': documents, 'nav':navigator.at_list()})

def delete_all_documents(request):
    navigator = create_navigator()
    if request.method == 'POST':
        # Borrar todos los objetos Document
        documents = Document.objects.all()
        for document in documents:
            document.delete()
        # Redirigir al usuario a otra página, por ejemplo la página de inicio
        return redirect('index')
    # Si el método no es POST, mostrar el formulario para confirmar la acción
    return render(request, 'borrar_documentos.html', {'nav':navigator.at_list()})

def load_map_data(request):
    search = request.GET.get('q', '')
    documents = Document.objects.filter_by_title(search)
    results = []
    if len(documents) == 1 and search != '':
        document = documents[0]
        for coordinate in document.coordinates.all():
            results.append({
                "lat": coordinate.latitud ,
                "lng": coordinate.longitud,
                "time": coordinate.time,
            })
    return JsonResponse({"data":results})
            