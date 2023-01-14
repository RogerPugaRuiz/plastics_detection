import parameters
from net import Init
import sys

if __name__ == "__main__":
    argv = sys.argv
    print(argv)
    if len(argv) == 3:
        source_data_dir = argv[1]
        output_data_dir = argv[2]
        init = Init(params_model=parameters.params_model,
                    model_dir=parameters.model_dir,
                    source_data_dir=source_data_dir, 
                    output_data_dir=output_data_dir)
    else:
        print("two arguments are required to be able to execute the command")
