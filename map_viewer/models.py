from django.db import models
from django.db.models import Q
from plastic_detection import settings
import os
import csv

class DocumentManager(models.Manager):
    def filter_by_title(self, busqueda):
        documentos = Document.objects.filter(
            Q(title__icontains=busqueda) | Q(coordinates__name__icontains=busqueda)
        ).distinct()
        return documentos

# Create your models here.
class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
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
