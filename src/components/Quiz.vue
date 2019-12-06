<template lang="html">
    <div>
        <div>
            <div v-for="(item, index) in quiz" :key="index">
                <h2>
                    {{ item.question }}
                    <span
                        v-if="item.result"
                        v-text="item.result == 'Y' ? '정답' : '오답'"
                    ></span>
                </h2>
                <ol>
                    <li v-for="(example, no) in item.examples" :key="no">
                        <input
                            type="radio"
                            v-model="item.answer"
                            :value="no + 1"
                            :name="'example' + item.quizId"
                            :id="'example' + item.quizId + no"
                        />
                        <label :for="'example' + item.quizId + no">{{
                            example
                        }}</label>
                    </li>
                </ol>
            </div>
        </div>

        <input type="text" v-model="name" placeholder="이름" />
        <button @click="onCheck">정답 확인</button>

        <pre>{{ answerSheet }}</pre>
    </div>
</template>

<script>
import axios from "axios";
export default {
    name: "Quiz",
    data() {
        return {
            quiz: [],
            answerSheet: [],
            name: null
        };
    },

    watch: {
        quiz: {
            deep: true,
            handler(to) {
                this.answerSheet = [];
                to.forEach(item => {
                    console.log(item);
                    let answerText = item.examples[item.answer - 1];
                    this.answerSheet.push({
                        quizId: item.quizId,
                        answer: item.answer,
                        answerText: answerText
                    });
                });
            }
        }
    },
    async created() {
        const { data } = await axios.get("/api/quiz.json");
        data.data.forEach(item => {
            item.answer = null;
            item.result = null;
            item.examples = item.example
                .split(",")
                .map(item => item.replace(/\n/g, ""));
        });
        this.quiz = data.data;
    },
    methods: {
        async onCheck() {
            if (!this.name) {
                alert("이름을 입력해주세요!");
                return false;
            }
            const { data } = await axios.post("/api/quiz/check.json", {
                sheet: this.answerSheet
            });
            this.quiz.forEach((item, index) => {
                item.result = data.data[index].result;
            });
            this.answerSheet = data.data;
            this.onSubmit();
        },
        async onSubmit() {
            let answers = [];
            let pass = [];
            let fail = [];
            this.answerSheet.forEach(item => {
                const text =
                    item.quizId +
                    "," +
                    item.answer +
                    "," +
                    item.answerText +
                    "," +
                    item.result;

                answers.push(text);

                if (item.result == "Y") {
                    pass.push(text);
                } else {
                    fail.push(text);
                }
            });
            const params = {
                answers: answers.join("|"),
                pass: pass.join("|"),
                fail: fail.join("|"),
                name: this.name
            };
            const { data } = await axios.post("/api/quiz.json", params);
            console.log(data);
        }
    }
};
</script>

<style scope lang="scss">
ol {
    li {
        position: relative;
        input {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            opacity: 0;
            cursor: pointer;
            &:checked {
                & + label {
                    background-color: red;
                }
            }
        }
    }
}
pre {
    position: fixed;
    right: 0;
    top: 0;
    padding: 15px;
}
</style>
