def validate_sequence(sequence):
    valid_bases = set("ATCGN")

    sequence = sequence.upper()

    return all(base in valid_bases for base in sequence)
