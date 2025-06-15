import json
import re

def json_to_env_string(input_file, output_file=None):
    # Read the JSON file
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    # Convert back to string with minimal formatting
    json_str = json.dumps(data, separators=(',', ':'))
    
    # Escape special characters
    env_str = json_str.replace('\\n', '\\\\n')  # Double escape newlines
    env_str = env_str.replace('"', '\\"')       # Escape quotes
    
    # Add single quotes around the entire string
    env_str = f"'{env_str}'"
    
    # Print to console
    print("Environment variable string:")
    print(env_str)
    
    # Optionally write to file
    if output_file:
        with open(output_file, 'w') as f:
            f.write(env_str)
        print(f"\nSaved to {output_file}")
    
    return env_str

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Convert JSON to env string')
    parser.add_argument('input', help='Path to input JSON file')
    parser.add_argument('-o', '--output', help='Optional output file path')
    
    args = parser.parse_args()
    
    json_to_env_string(args.input, args.output)