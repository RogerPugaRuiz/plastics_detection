from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('importar-documento/', views.import_document, name='importar_documento'),
    path('documentos/', views.list_documents, name='listar_documentos'),
    path('map/', views.map, name='map')
]