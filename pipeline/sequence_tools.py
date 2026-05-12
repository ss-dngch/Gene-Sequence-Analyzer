from Bio.Seq import Seq


def reverse_complement(sequence):
    seq = Seq(sequence)
    return str(seq.reverse_complement())


def transcribe_dna(sequence):
    seq = Seq(sequence)
    return str(seq.transcribe())


def translate_sequence(sequence):
    seq = Seq(sequence)
    return str(seq.translate())
