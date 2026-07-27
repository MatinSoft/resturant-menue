import os
import glob

def collect_code_files(directory_path, output_file="combined_code.txt", extensions=None):
    if extensions is None:
        extensions = ['.jsx', '.js', 'py']
    
    directory_path = os.path.abspath(directory_path)
    
    if not os.path.exists(directory_path):
        print(f"Error: Directory '{directory_path}' does not exist.")
        return
    
    all_files = []
    for ext in extensions:
        pattern = os.path.join(directory_path, f"**/*{ext}")
        all_files.extend(glob.glob(pattern, recursive=True))
    
    if not all_files:
        print(f"No code files found in '{directory_path}' with extensions: {extensions}")
        return
    
    all_files.sort()
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for file_path in all_files:
            file_name = os.path.basename(file_path)
            relative_path = os.path.relpath(file_path, directory_path)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as infile:
                    content = infile.read()
                
                outfile.write(f"\n{'='*80}\n")
                outfile.write(f"FILE: {file_name}\n")
                outfile.write(f"PATH: {relative_path}\n")
                outfile.write(f"FULL PATH: {file_path}\n")
                outfile.write(f"{'='*80}\n\n")
                
                outfile.write(content)
                
                if content and not content.endswith('\n'):
                    outfile.write('\n')
                
                print(f"✓ Added: {relative_path}")
                
            except Exception as e:
                error_msg = f"Error reading {file_name}: {str(e)}"
                outfile.write(f"\n{'='*80}\n")
                outfile.write(f"FILE: {file_name}\n")
                outfile.write(f"ERROR: {error_msg}\n")
                outfile.write(f"{'='*80}\n\n")
                print(f"✗ {error_msg}")
    
    print(f"\n✅ All code files have been combined into '{output_file}'")
    print(f"📁 Total files processed: {len(all_files)}")

if __name__ == "__main__":
    directory = input("Enter the directory path containing code files: ").strip()
    collect_code_files(directory)