# Generated by Django 4.1.7 on 2023-02-28 10:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('map_viewer', '0005_coordenate_delete_coordenada'),
    ]

    operations = [
        migrations.CreateModel(
            name='Coordinate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('latitud', models.FloatField()),
                ('longitud', models.FloatField()),
                ('time', models.CharField(max_length=255)),
                ('plastico_objeto', models.IntegerField()),
                ('medusas', models.IntegerField()),
                ('otros', models.IntegerField()),
                ('plastico_agregados', models.IntegerField()),
                ('boyas', models.IntegerField()),
                ('document', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='coordinates', to='map_viewer.document')),
            ],
        ),
        migrations.DeleteModel(
            name='Coordenate',
        ),
    ]
