# Generated by Django 4.1.7 on 2023-02-27 09:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('map_viewer', '0002_document_date_time_coordenada'),
    ]

    operations = [
        migrations.AlterField(
            model_name='coordenada',
            name='boyas',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='coordenada',
            name='medusas',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='coordenada',
            name='otros',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='coordenada',
            name='plastico_agregados',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='coordenada',
            name='plastico_objeto',
            field=models.IntegerField(),
        ),
    ]
