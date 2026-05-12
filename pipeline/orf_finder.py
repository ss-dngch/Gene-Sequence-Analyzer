from Bio.Seq import Seq


def find_orfs(sequence, min_length=30):
    sequence = sequence.upper()

    stop_codons = {"TAA", "TAG", "TGA"}

    orfs = []

    for frame in range(3):
        start = None

        for i in range(frame, len(sequence) - 2, 3):
            codon = sequence[i : i + 3]

            if codon == "ATG" and start is None:
                start = i

            elif codon in stop_codons and start is not None:
                end = i + 3
                orf_seq = sequence[start:end]

                if len(orf_seq) >= min_length:
                    orfs.append(
                        {
                            "start": start + 1,
                            "end": end,
                            "length": len(orf_seq),
                            "sequence": orf_seq,
                        }
                    )

                start = None

    return orfs
