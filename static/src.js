
        function generate() {
            console.log("Button clicked!");  // Debug: Check console for this
            
            const dataFile = document.getElementById("data_file").files[0];
            const outputType = document.getElementById("output_type").value;
            
            if (!dataFile) {
                alert("Please upload a data file first!");
                return;
            }
            
            console.log("File uploaded:", dataFile.name);  // Debug
            
            // Show loading
            document.getElementById("plot-placeholder").innerHTML = "Generating plot...";
            
            // Generate GNUplot code
            const inputFileName = dataFile.name.replace(/\.[^/.]+$/, "");
            const extension = outputType.includes("png") ? "png" : "pdf";
            const outputFile = `${inputFileName}.${extension}`;
            
            const gnuplotCode = `# Generated for "${inputFileName}"
set terminal ${outputType}
set output "${outputFile}"
plot "${inputFileName}" using 2:xtic(1) with linespoints
reset
`;
            
            // Display code (this should ALWAYS show if file uploaded)
            document.getElementById("output_code").textContent = gnuplotCode;
            console.log("Code generated:", gnuplotCode);  // Debug
            
            // Send to backend
            const formData = new FormData();
            formData.append("data_file", dataFile);
            formData.append("gnuplot_code", gnuplotCode);
            formData.append("output_type", outputType);
            formData.append("output_file", outputFile);
            formData.append("input_file_name", inputFileName);
            
            fetch("/generate", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log("Backend response:", data);  // Debug
                if (data.success) {
                    if (extension === "png") {
                        document.getElementById("plot-placeholder").innerHTML = 
                            `<img src="data:image/png;base64,${data.base64_image}" alt="Generated Plot">`;
                    } else {
                        document.getElementById("plot-placeholder").innerHTML = 
                            `<embed src="data:application/pdf;base64,${data.base64_image}" type="application/pdf" width="100%" height="600px">`;
                    }
                } else {
                    document.getElementById("plot-placeholder").innerHTML = `Error: ${data.error}`;
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
                document.getElementById("plot-placeholder").innerHTML = `Error: ${error}`;
            });
        }
