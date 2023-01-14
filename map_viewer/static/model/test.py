from net import Init
import parameters

if __name__ == "__main__":
    source_data_dir = "/home/roger/Imágenes"
    output_data_dir = "/home/roger/Documentos"
    init = Init(params_model=parameters.params_model,
                model_dir=parameters.model_dir,
                source_data_dir=source_data_dir, 
                output_data_dir=output_data_dir)
