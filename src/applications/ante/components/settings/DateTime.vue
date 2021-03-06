<template>
    <v-form>
        <v-card>
            <v-card-title primary-title>
                <v-layout row wrap>
                    <h1>{{'DATE_TIME' | lang}}</h1>
                    <v-flex xs12>
                        <v-select
                                :label="'TIME_ZONE' | lang"
                                v-model="timeZone"
                                :items="timeZones"
                                :rules="[v => !!v || 'Item is required']"
                                required
                        ></v-select>
                    </v-flex>

                    <template v-if="float">
                        <v-flex xs12>
                            <v-date-picker class="float_packer" v-model="currDate" :landscape="!isMobileScreen"></v-date-picker>
                            <v-time-picker class="float_packer" v-model="currTime" :landscape="!isMobileScreen" format="24hr"></v-time-picker>
                        </v-flex>
                    </template>
                    <template v-else>
                        <v-flex xs12 class="text-xs-center">
                            <v-date-picker :style="isMobileScreen ? {width:'100%'} : {}" v-model="currDate" :landscape="!isMobileScreen"></v-date-picker>
                        </v-flex>
                        <v-flex xs12>
                            <v-time-picker :style="isMobileScreen ? {width:'100%'} : {}" v-model="currTime" :landscape="!isMobileScreen" format="24hr"></v-time-picker>
                        </v-flex>
                    </template>
                    <v-flex xs12>
                        <span style="display: block; height: 16px;"></span>
                        <v-checkbox v-bind:label="'NTP_SYNC' | lang" v-model="ntp_sync"></v-checkbox>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-actions text-xs-right style="margin-top: -28px;">
                <v-btn v-if="!hideActions" @click="submit">{{'SUBMIT' | lang }}</v-btn>
                <v-btn @click="reset" flat>{{'RESET' | lang }}</v-btn>
                <v-btn @click="current" flat>{{'CURRENT' | lang }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script>

    import consts from 'consts';
    import template from './Template.vue'

    export default {
        name: 'SettingsDatetime',
        extends : template,
        computed: {

            currDate : {
                get(){
                    if(this.custom_date)
                        return this.custom_date
                    else
                        return this.getFormattedDate(this.hwDateTime, 'vuetifyjs');
                },
                set(value){
                    this.custom_date = value;
                }
            },

            currTime : {
                get(){
                    if(this.custom_time)
                        return this.custom_time
                    else
                        return this.getFormattedTime(this.hwDateTime, 'vuetifyjs');
                },
                set(value){
                    this.custom_time = value;
                }
            },

            timeZones(){
                return consts.TIME_ZONES;
            },
            timeZone : {
                get(){

                    if(this.new_timezone)
                        return this.new_timezone;

                    let time_offset = this.$store.state.datetime.time_zone_offset;

                    if(time_offset === null)
                        time_offset = -(new Date).getTimezoneOffset();

                    for(let timezone in consts.TIME_ZONES){
                        if((+consts.TIME_ZONES[timezone].offset) == (+time_offset))
                            return consts.TIME_ZONES[timezone].value;
                    }

                    return null;
                },
                set(value){
                    this.new_timezone = value;
                }
            },

            timezoneOffset() {

                for(let timezone in consts.TIME_ZONES){
                    if(consts.TIME_ZONES[timezone].value == this.timeZone)
                        return consts.TIME_ZONES[timezone].offset;
                }

                return 0;
            }
        },
        props :{
            float: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            current(){
                this.custom_date    = this.getFormattedDate(new Date, 'vuetifyjs');
                this.custom_time    = this.getFormattedTime(new Date, 'vuetifyjs');

                let current_offset  = -(new Date).getTimezoneOffset();

                for(let timezone in consts.TIME_ZONES){
                    if(consts.TIME_ZONES[timezone].offset == current_offset)
                        this.new_timezone = consts.TIME_ZONES[timezone].value;
                }
            },
            reset(){
                this.custom_date    = null;
                this.custom_time    = null;
                this.new_timezone   = null;
            },
            submit(){
                let curr_moment = (new Date(this.currDate + ' ' +this.currTime));
                curr_moment = curr_moment.getTime() - curr_moment.getTimezoneOffset() * 60000;

                this.$store.dispatch('putConfiguration', {
                    data : {
                        time : {
                            current : "" + curr_moment,
                            offset : "" + this.timezoneOffset
                        }
                    }
                });
            }
        },

        data () {
            return {
                custom_date : null,
                custom_time : null,
                ntp_sync : true,
                new_timezone : null
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    
    .float_packer {
        float: left;
    }
    
</style>
