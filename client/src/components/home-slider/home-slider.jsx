import './home-slider.css'
import React, { useState } from 'react'

const HomeSlider = () => {
    const [slideIndex, setSlideIndex] = useState(1)

    const slideNext = () => {
        setSlideIndex(prev => prev === 2 ? 1 : ++prev)
    }
    const slidePrev = () => {
        setSlideIndex(prev => prev === 1 ? 2 : --prev)
    }
    return (
        <div className='home-slider'>
            {
                slideIndex === 1 ? <div className='main-page-right-slide slide-1'>
                    <img src="/images/main-slide-1.svg" alt="slide" />
                    <div>
                        <h3>Get a link you can share</h3>
                        <p>click <strong>New Meeting</strong> to get a link you can send to people you want to meet with</p>
                    </div>
                </div> :
                    // slideIndex === 2 ?
                    //     <div className='main-page-right-slide slide-2'>
                    //        <img src="/images/main-slide-2.svg" alt="slide" />
                    //        <div>
                    //            <h3>Plan ahead</h3>
                    //            <p>click <strong>New Meeting</strong> to schedule meetings in     Google Calendar and send invites to participants</p>
                    //        </div>
                    //    </div> :
                        slideIndex === 2 ?
                            <div className='main-page-right-slide slide-3'>
                                <img src="/images/main-slide-3.svg" alt="slide" />
                                <div>
                                    <h3>Your meeting is safe</h3>
                                    <p>No one can join a meeting unless admitted by the host</p>
                                </div>
                            </div> : null}
            <button className='prev-slide' disabled={slideIndex === 1} onClick={slidePrev}>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" /></svg>
            </button>
            <button className='prev-slide' disabled={slideIndex === 2} onClick={slideNext}>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" /></svg>
            </button>
            <div className='main-right-slider-indicator'>
                <span className={slideIndex === 1  ? 'active-slide' : ''}></span>
                {/* <span className={slideIndex === 2  ? 'active-slide' : ''}></span> */}
                <span className={slideIndex === 2  ? 'active-slide' : ''}></span>
            </div>
        </div>
    )
}

export default HomeSlider