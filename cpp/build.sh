#!/bin/sh

cc=clang++

compile() {
	$cc -std=c++2a $1 -o $2 && echo "build: $1 -> $2"
}

echo "Be sure to modify data path before you run ./gen-filter"
echo
compile make_filter.cpp ./gen-filter \
&& compile query.cpp ./query \
&& compile query_mem.cpp ./query-mem \
&& echo "OJBK"

