from flask import Flask, request, jsonify
import subprocess
import tempfile
import os
import base64

app = Flask(__name__)
app = Flask(__name__, static_folder='static')

@app.route("/")
def index():
    # Serve your HTML
    with open("try.html", "r") as f:
        return f.read()

@app.route("/generate", methods=["POST"])
def generate_plot():
    try:
        # Get uploaded file and code
        input_file_name = request.form["input_file_name"]
        data_file = request.files["data_file"]
        gnuplot_code = request.form["gnuplot_code"]
        output_type = request.form["output_type"]
        output_filename = request.form["output_file"]  # e.g., "data.png"
        
        # Create temp dir for all files (cross-platform)
        with tempfile.TemporaryDirectory() as temp_dir:
            data_path = os.path.join(temp_dir, input_file_name)
            script_path = os.path.join(temp_dir, "script.gp")
            output_path = os.path.join(temp_dir, output_filename)
            
            # Save uploaded data file
            data_file.save(data_path)
            
            # Write GNUplot script (replace output path with temp one)
            script_content = gnuplot_code.replace(f'"{output_filename}"', f'"{output_path}"', 1)
            with open(script_path, "w") as f:
                f.write(script_content)
            
            # Run GNUplot
            cmd = ["gnuplot", script_path]
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=temp_dir)
            
            if result.returncode != 0:
                raise Exception(f"GNUplot error: {result.stderr}")
            
            # Read output file as base64
            with open(output_path, "rb") as img_file:
                base64_image = base64.b64encode(img_file.read()).decode("utf-8")
        
        return jsonify({"success": True, "base64_image": base64_image})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Use Render's PORT or default to 5000
    app.run(host="0.0.0.0", port=port, debug=True)