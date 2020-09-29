#include "bitvec.inl"
#include <cstdio>

const string weiboDataTxt = "C:\\Users\\GuYangyang\\Downloads\\www_weibo_com_tel.txt";
const string saveBitvec = "../bloom-filter-data.bin";
const i64 numItems = 503925369;
// error = 2%
const int numHashFns = 6;
const i64 numBits = 4103143449; /* 489.13MiB */

u64 mix_hash(u64 data, u64 param) {
	u64 mixed = ((unsigned long)param << 32) | data;
	return fnv_1a_64((char *)&mixed, sizeof(u64));
}

const u64 magic[numHashFns] {0, 810, 893, 1919, 114514, 1919810};
void bloom_add(bitvec &bv, u64 data) {
	for (u64 p : magic) {
		bv.set_at(mix_hash(data, p) % bv.size, 1);
	}
}

int bloom_query(bitvec &bv, u64 data) {
	for (u64 p : magic) {
		if (bv.get_at(mix_hash(data, p) % bv.size) == 0) return 0;
	}
	return 1;
}

void process_weibo_data() {
	using namespace std;
	bitvec bv { numBits }; // bloom filter
	FILE *stream = fopen(weiboDataTxt.c_str(), "r");
	if (! stream) {
		printf("Failed to open %s; \n", weiboDataTxt.c_str());
		exit(1);
	}
	printf("Read OK;\n");
	u64 cnt = 0, err = 0, tel, uid;
	char *line = nullptr;
	size_t line_cap = 0;
	while (getline(&line, &line_cap, stream) != -1) {
		++ cnt; // line number
		if (2 == sscanf(line, "%llu %llu", &tel, &uid)) {
			bloom_add(bv, uid);
		} else {
			++ err;
			printf("Error: failed to extract from [%s]\n", line);
		}
	}
	printf("Read %llu, error %llu,\n added %llu entries to filter;\n", cnt, err, cnt - err);
	printf("Writing to disk file ...\n");
	bv.dump_to_file(saveBitvec);
	printf("Saved to disk file;\n");
	printf("Mission completed.\n");
	fclose(stream);

	if (line) free(line);
}
