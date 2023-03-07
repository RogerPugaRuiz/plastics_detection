from django.db import models
from django.db.models import Q
from django.urls import reverse
from plastic_detection import settings
import os
import csv
import magic
import subprocess
from django.core.exceptions import ValidationError


ALLOWED_MIME_TYPES = ['text/csv']

def validate_csv_file(file):
    required_columns = ['id', 'lat', 'lng', 'time', 'plastico objeto', 'medusas', 'otros', 'plastico agregados', 'boyas']
    dialect = csv.Sniffer().sniff(file.read(1024).decode('utf-8'))
    file.seek(0)
    reader = csv.reader(file, dialect=dialect)
    header = next(reader)
    if set(required_columns) - set(header):
        raise ValueError(f"Las siguientes columnas son requeridas: {', '.join(required_columns)}")

class DocumentManager(models.Manager):
    def filter_by_title(self, busqueda):
        documentos = Document.objects.filter(
            Q(title__icontains=busqueda) | Q(coordinates__name__icontains=busqueda)
        ).distinct()
        return documentos

# Create your models here.
class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/', validators=[validate_csv_file])
    date_time = models.DateTimeField(auto_now_add=True)

    objects = DocumentManager()
    def __str__(self):
        return self.title

    def delete(self, *args, **kwargs):
        # Borra el archivo asociado antes de borrar la instancia de Document
        path = os.path.join(settings.MEDIA_ROOT, self.file.name)
        os.remove(path)
        self.file.delete()
        super().delete(*args, **kwargs)

    def save_with_coordinates(self):
        # Guardar el objeto Document en la base de datos
        super().save()

        # Obtener el archivo asociado al documento

        with open(self.file.path, 'rt') as archivo:
            # Leer los datos del archivo CSV
            datos = csv.reader(archivo, delimiter=";")

            # Crear las coordenadas a partir de los datos del archivo
            index = 0
            coordinates_batch = []
            for fila in datos:
                if index != 0:
                    nueva_coordenada = Coordinate(
                        document=self,
                        name=fila[0],
                        latitud=float(fila[1].replace(",", ".")),
                        longitud=float(fila[2].replace(",", ".")),
                        time=fila[3],
                        plastico_objeto=int(fila[4]),
                        medusas=int(fila[5]),
                        otros=int(fila[6]),
                        plastico_agregados=int(fila[7]),
                        boyas=int(fila[8])
                    )
                    coordinates_batch.append(nueva_coordenada)
                index += 1

            # Crea los objetos Coordinate en lotes de 1000
            if len(coordinates_batch) == 1000:
                Coordinate.objects.bulk_create(coordinates_batch)
                coordinates_batch = []

        # Crear los objetos Coordinate restantes
        if coordinates_batch:
            Coordinate.objects.bulk_create(coordinates_batch)


class Coordinate(models.Model):
    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name='coordinates')
    name = models.CharField(max_length=255)
    latitud = models.FloatField()
    longitud = models.FloatField()
    time = models.CharField(max_length=255)
    plastico_objeto = models.IntegerField()
    medusas = models.IntegerField()
    otros = models.IntegerField()
    plastico_agregados = models.IntegerField()
    boyas = models.IntegerField()

    def __str__(self):
        return f'{self.latitud}, {self.longitud}'

class Element():
    def __init__(self, text_element:str=None, id_element:str=None, href_element:str=None, subelements:list=None, add_separator:bool=False) -> None:
        self.text_element = text_element
        self.id_element = id_element
        self.href_element = href_element
        self.subelements = subelements
        self.add_separator = add_separator
    
    def __str__(self) -> str:
        return "text : {}, id : {}, href : {}, subelements : {} ".format(self.text_element, self.id_element, self.href_element, self.subelements)

    def get_dict(self) -> dict:
        return {'text':self.text_element, 'id':self.id_element, 'href': self.href_element, 'subelements':self.subelements}

    def get_url(self):
        return reverse(self.href_element)
        


class Navigator():
    def __init__(self, elements:list=[]) -> None:
        self.elements = elements

    def add_element(self, element:Element):
        self.elements.append(element)


    def __str__(self) -> str:
        return self.elements

    def at_list(self) -> list:
        return self.elements
    
    def remove_all_elemnets(self):
        self.elements = []
    

def create_navigator():
    navigator = Navigator()
    navigator.remove_all_elemnets()
    navigator.add_element(Element(text_element='Mapa',id_element='nav-mapa',href_element='index'))
    navigator.add_element(Element(text_element='Archivo', id_element='nav-archivo', subelements= [
        Element(text_element='Crear nuevo documento', id_element='crear-nuevo-documento-button'),
        Element(text_element='Importar documento', id_element='importar-documento-button'),
        Element(text_element='Exportar documento', id_element='exportar-documento-button'),
        Element(text_element='Documentos añadidos', id_element='documentos-añadidos-button', href_element="listar_documentos", add_separator=True),
        Element(text_element='Abrir documneto', id_element='agregar-documento-al-mapa-button'),
        Element(text_element='Cerrar documneto', id_element='cerrar-documento-button', add_separator=True),
        Element(text_element='Preferencias', id_element='preferencias')
    ]))
    navigator.add_element(Element(text_element='Ver',id_element='nav-ver', subelements=[
        Element(text_element='Coordenadas', id_element='ver-coordenadas'),
        Element(text_element='Buscar coordenadas por ...', id_element='ver-coordenadas-por-button', add_separator=True),
        Element(text_element='Buscar en los documentos por ...', id_element='ver-filtrar-documentos', add_separator=True),
        Element(text_element='Documento cargado: ', id_element='ver-documento-cargado-button'),

    ]))
    navigator.add_element(Element(text_element='Editar',id_element='map-editar', subelements=[
        Element(text_element='Deshacer', id_element='deshacer'),
        Element(text_element='Rehacer', id_element='rehacer', add_separator=True),
        Element(text_element='Editar coordenada', id_element='editar-coordenada'),
        Element(text_element='Editar documento', id_element='editar-documento'),
        Element(text_element='Editar capas', id_element='editar-capas')

    ]))
    navigator.add_element(Element(text_element='Ejecutar', id_element='map-ejecutar', subelements=[
        Element(text_element='Detectar plásticos', id_element='detectar-plasticos-button'),
    ]))
    navigator.add_element(Element(text_element='Ayuda', id_element='ayuda'))
    return navigator