# device
device = "cpu"
# target dimension (CNN input dimension)
input_dim = [128, 128]
# model dir
model_dir = "/home/roger/Documentos/plastic_detection/map_viewer/static/model/weights/model_weights_at_epoch-19-val_loss-0.37941244525656836.pt"

params_model={
        "input_shape": (3, input_dim[1], input_dim[0]),
        "initial_filters": 2,
        "num_fc1": 1024,
        "num_fc2": 256,
        "dropout_rate": 0.3,
        "num_classes": 2,
        }