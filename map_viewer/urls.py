from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('importar-documento/', views.import_document, name='importar_documento'),
    path('borrar-documentos/', views.delete_all_documents, name='borrar_documentos'),
    path('documentos/', views.list_documents, name='listar_documentos'),
    # path('map/', views.map, name='map'),
    path('documentos-ajax/', views.find_document_ajax, name='buscar_documento_ajax'),
    path('cargar-con-ajax/', views.load_map_data, name='cargar_datos_al_mapa_ajax'),
]