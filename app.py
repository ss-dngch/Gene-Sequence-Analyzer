from flask import Flask, render_template, request, jsonify
from Bio import SeqIO
from io import StringIO

from pipeline.qc import validate_sequence
from pipeline.sequence_stats import calculate_stats
from pipeline.sequence_tools import (
    reverse_complement,
    transcribe_dna,
    translate_sequence,
)
from pipeline.orf_finder import find_orfs
from pipeline.mutations import detect_mutations

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    sequence_text = ""

    if "file" in request.files and request.files["file"].filename:
        uploaded_file = request.files["file"]
        sequence_text = uploaded_file.read().decode("utf-8")
    else:
        data = request.get_json()
        sequence_text = data.get("sequence", "")

    try:
        records = list(SeqIO.parse(StringIO(sequence_text), "fasta"))

        if records:
            sequence = str(records[0].seq).upper()
            sequence_id = records[0].id
        else:
            sequence = sequence_text.replace("\n", "").replace(" ", "").upper()
            sequence_id = "pasted_sequence"

        if not validate_sequence(sequence):
            return jsonify(
                {
                    "success": False,
                    "error": "Invalid DNA sequence. Please use only A, T, C, G, or N.",
                }
            )

        stats = calculate_stats(sequence)
        orfs = find_orfs(sequence)
        rev_comp = reverse_complement(sequence)
        rna = transcribe_dna(sequence)
        protein = translate_sequence(sequence)

        return jsonify(
            {
                "success": True,
                "sequence_id": sequence_id,
                "sequence": sequence,
                "stats": stats,
                "orfs": orfs,
                "reverse_complement": rev_comp,
                "rna": rna,
                "protein": protein,
            }
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route("/compare", methods=["POST"])
def compare():
    data = request.get_json()

    reference_text = data.get("reference", "")
    sample_text = data.get("sample", "")

    try:
        reference_records = list(SeqIO.parse(StringIO(reference_text), "fasta"))
        sample_records = list(SeqIO.parse(StringIO(sample_text), "fasta"))

        if reference_records:
            reference_sequence = str(reference_records[0].seq).upper()
        else:
            reference_sequence = (
                reference_text.replace("\n", "").replace(" ", "").upper()
            )

        if sample_records:
            sample_sequence = str(sample_records[0].seq).upper()
        else:
            sample_sequence = sample_text.replace("\n", "").replace(" ", "").upper()

        if not validate_sequence(reference_sequence):
            return jsonify({"success": False, "error": "Invalid reference sequence."})

        if not validate_sequence(sample_sequence):
            return jsonify({"success": False, "error": "Invalid sample sequence."})

        mutations = detect_mutations(reference_sequence, sample_sequence)

        return jsonify(
            {
                "success": True,
                "reference_length": len(reference_sequence),
                "sample_length": len(sample_sequence),
                "mutation_count": len(mutations),
                "mutations": mutations,
            }
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)
