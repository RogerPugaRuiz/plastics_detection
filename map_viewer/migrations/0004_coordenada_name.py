# Generated by Django 4.1.7 on 2023-02-27 09:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('map_viewer', '0003_alter_coordenada_boyas_alter_coordenada_medusas_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='coordenada',
            name='name',
            field=models.CharField(default='Sin nombre', max_length=255),
            preserve_default=False,
        ),
    ]
