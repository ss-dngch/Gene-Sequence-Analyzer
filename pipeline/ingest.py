from Bio import SeqIO


def load_fasta(filepath):
    records = list(SeqIO.parse(filepath, "fasta"))

    if not records:
        raise ValueError("No sequences found in FASTA file.")

    return records
